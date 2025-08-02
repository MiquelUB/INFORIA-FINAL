-- Create subscriptions table for SaaS subscription management
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL CHECK (plan_id IN ('free', 'profesional', 'clinica', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'limit_reached', 'expired')),
    reports_limit INTEGER NOT NULL DEFAULT 10,
    reports_used INTEGER NOT NULL DEFAULT 0,
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    
    -- Ensure one subscription per user
    CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON public.subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON public.subscriptions(current_period_end);

-- Enable Row Level Security (RLS)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscriptions_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.subscriptions IS 'User subscription management for SaaS limits';
COMMENT ON COLUMN public.subscriptions.plan_id IS 'Subscription plan type (free, profesional, clinica, enterprise)';
COMMENT ON COLUMN public.subscriptions.status IS 'Current subscription status';
COMMENT ON COLUMN public.subscriptions.reports_limit IS 'Maximum number of reports allowed in current period';
COMMENT ON COLUMN public.subscriptions.reports_used IS 'Number of reports used in current period';
COMMENT ON COLUMN public.subscriptions.current_period_start IS 'Start date of current billing period';
COMMENT ON COLUMN public.subscriptions.current_period_end IS 'End date of current billing period';

-- Insert default subscription for existing users (if any)
-- This will be handled by the application logic when users first access the system
-- For now, we'll create a sample subscription for testing

-- Create a function to initialize subscription for new users
CREATE OR REPLACE FUNCTION initialize_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.subscriptions (
        user_id,
        plan_id,
        status,
        reports_limit,
        reports_used,
        current_period_start,
        current_period_end
    ) VALUES (
        NEW.id,
        'free',
        'active',
        10,
        0,
        now(),
        now() + INTERVAL '1 month'
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically create subscription for new users
CREATE TRIGGER create_user_subscription
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION initialize_user_subscription();

-- Create RPC function for subscription renewal
CREATE OR REPLACE FUNCTION renew_subscription_plan()
RETURNS JSON AS $$
DECLARE
    user_subscription RECORD;
    new_period_end TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get current user's subscription
    SELECT * INTO user_subscription
    FROM public.subscriptions
    WHERE user_id = auth.uid();
    
    -- Check if subscription exists
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'No subscription found for user'
        );
    END IF;
    
    -- Calculate new period end (1 month from now)
    new_period_end := now() + INTERVAL '1 month';
    
    -- Update subscription
    UPDATE public.subscriptions
    SET 
        reports_used = 0,
        current_period_start = now(),
        current_period_end = new_period_end,
        status = 'active',
        updated_at = now()
    WHERE user_id = auth.uid();
    
    -- Return success
    RETURN json_build_object(
        'success', true,
        'message', 'Subscription renewed successfully',
        'new_period_end', new_period_end
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the RPC function
GRANT EXECUTE ON FUNCTION renew_subscription_plan() TO authenticated;

-- Create RPC function to get subscription status
CREATE OR REPLACE FUNCTION get_subscription_status()
RETURNS JSON AS $$
DECLARE
    user_subscription RECORD;
BEGIN
    -- Get current user's subscription
    SELECT * INTO user_subscription
    FROM public.subscriptions
    WHERE user_id = auth.uid();
    
    -- Check if subscription exists
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'No subscription found for user'
        );
    END IF;
    
    -- Return subscription data
    RETURN json_build_object(
        'success', true,
        'subscription', json_build_object(
            'plan_id', user_subscription.plan_id,
            'status', user_subscription.status,
            'reports_limit', user_subscription.reports_limit,
            'reports_used', user_subscription.reports_used,
            'reports_remaining', user_subscription.reports_limit - user_subscription.reports_used,
            'current_period_start', user_subscription.current_period_start,
            'current_period_end', user_subscription.current_period_end,
            'is_active', user_subscription.status = 'active',
            'can_create_reports', user_subscription.status = 'active' AND user_subscription.reports_used < user_subscription.reports_limit
        )
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the RPC function
GRANT EXECUTE ON FUNCTION get_subscription_status() TO authenticated;

-- Create RPC function to increment reports used
CREATE OR REPLACE FUNCTION increment_reports_used()
RETURNS JSON AS $$
DECLARE
    user_subscription RECORD;
    new_reports_used INTEGER;
BEGIN
    -- Get current user's subscription
    SELECT * INTO user_subscription
    FROM public.subscriptions
    WHERE user_id = auth.uid();
    
    -- Check if subscription exists
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'No subscription found for user'
        );
    END IF;
    
    -- Check if user can create more reports
    IF user_subscription.status != 'active' OR user_subscription.reports_used >= user_subscription.reports_limit THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Report limit reached or subscription not active'
        );
    END IF;
    
    -- Increment reports used
    new_reports_used := user_subscription.reports_used + 1;
    
    -- Update subscription
    UPDATE public.subscriptions
    SET 
        reports_used = new_reports_used,
        status = CASE 
            WHEN new_reports_used >= reports_limit THEN 'limit_reached'
            ELSE status
        END,
        updated_at = now()
    WHERE user_id = auth.uid();
    
    -- Return success
    RETURN json_build_object(
        'success', true,
        'reports_used', new_reports_used,
        'reports_remaining', user_subscription.reports_limit - new_reports_used,
        'status', CASE 
            WHEN new_reports_used >= user_subscription.reports_limit THEN 'limit_reached'
            ELSE user_subscription.status
        END
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the RPC function
GRANT EXECUTE ON FUNCTION increment_reports_used() TO authenticated; 