import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink: string;
  size?: string;
}

interface Patient {
  id: string;
  full_name: string;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  reports_limit: number;
  reports_used: number;
  current_period_end: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405,
      });
    }

    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authentication token
    const authToken = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authToken) {
      return new Response(JSON.stringify({ error: "Authentication token is missing" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Verify user session
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authToken);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Authentication failed. Invalid JWT." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Parse request body
    const { patient_id, report_content, session_type } = await req.json();

    // Validate required fields
    if (!patient_id) {
      return new Response(JSON.stringify({ error: "patient_id is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!report_content || typeof report_content !== 'string' || report_content.trim() === '') {
      return new Response(JSON.stringify({ error: "report_content is required and must be a non-empty string" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!session_type || typeof session_type !== 'string' || session_type.trim() === '') {
      return new Response(JSON.stringify({ error: "session_type is required and must be a non-empty string" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Validate UUID format for patient_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(patient_id)) {
      return new Response(JSON.stringify({ error: "patient_id must be a valid UUID" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // STEP 1: Check user subscription and limits
    const { data: subscription, error: subscriptionError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subscriptionError || !subscription) {
      return new Response(JSON.stringify({ 
        error: "Subscription not found",
        message: "Please contact support to set up your subscription"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Check if subscription is active and user has remaining reports
    if (subscription.status !== 'active') {
      return new Response(JSON.stringify({ 
        error: "Subscription not active",
        message: "Your subscription is not active. Please renew your plan to continue creating reports."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    if (subscription.reports_used >= subscription.reports_limit) {
      return new Response(JSON.stringify({ 
        error: "Report limit reached",
        message: `You have reached your monthly limit of ${subscription.reports_limit} reports. Please upgrade your plan to continue.`,
        subscription: {
          plan_id: subscription.plan_id,
          reports_limit: subscription.reports_limit,
          reports_used: subscription.reports_used,
          reports_remaining: 0
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Get patient information from database
    const { data: patient, error: patientError } = await supabaseAdmin
      .from('patients')
      .select('id, full_name')
      .eq('id', patient_id)
      .eq('user_id', user.id)
      .single();

    if (patientError || !patient) {
      return new Response(JSON.stringify({ 
        error: "Patient not found or access denied",
        message: "The specified patient does not exist or you don't have access to it"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Generate standardized file name
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const patientName = patient.full_name.trim();
    const sessionType = session_type.trim();
    
    // Create standardized file name: YYYY-MM-DD - [Nombre del Paciente] - [Tipo de Sesión]
    const reportTitle = `${currentDate} - ${patientName} - ${sessionType}`;

    // Get user's Google OAuth token from Supabase
    const { data: { user: userWithProvider }, error: userError } = await supabaseAdmin.auth.admin.getUserById(user.id);
    if (userError || !userWithProvider) {
      return new Response(JSON.stringify({ error: "Failed to retrieve user information" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Check if user has Google OAuth connected
    const googleProvider = userWithProvider.app_metadata?.providers?.find(p => p === 'google');
    if (!googleProvider) {
      return new Response(JSON.stringify({ 
        error: "Google Drive integration not connected",
        message: "Please connect your Google account to save reports to Google Drive"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Get Google OAuth token from user's session
    const { data: { session } } = await supabaseAdmin.auth.getSession();
    const googleAccessToken = session?.provider_token;
    
    if (!googleAccessToken) {
      return new Response(JSON.stringify({ 
        error: "Google access token not available",
        message: "Please re-authenticate with Google to save reports"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Create Google Doc in user's Drive with standardized name
    const googleDriveFile = await createGoogleDoc(
      googleAccessToken,
      reportTitle,
      report_content
    );

    if (!googleDriveFile) {
      return new Response(JSON.stringify({ 
        error: "Failed to create Google Doc",
        message: "Unable to save report to Google Drive"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Insert report metadata into database
    const { data: report, error: insertError } = await supabaseAdmin
      .from('reports')
      .insert({
        user_id: user.id,
        patient_id: patient_id,
        gdrive_file_url: googleDriveFile.webViewLink,
        gdrive_file_id: googleDriveFile.id,
        file_name: reportTitle, // Use the standardized name
        file_size: googleDriveFile.size ? parseInt(googleDriveFile.size) : null
      })
      .select('id, created_at, gdrive_file_url, file_name')
      .single();

    if (insertError) {
      console.error('Error inserting report metadata:', insertError);
      return new Response(JSON.stringify({ 
        error: "Failed to save report metadata to database",
        details: insertError.message 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // STEP 2: Increment reports used counter
    const { data: incrementResult, error: incrementError } = await supabaseAdmin.rpc('increment_reports_used');
    
    if (incrementError) {
      console.error('Error incrementing reports used:', incrementError);
      // Note: We don't fail the report creation if increment fails
      // The report was already created successfully
    }

    // Return success response with updated subscription info
    return new Response(JSON.stringify({
      success: true,
      message: "Report saved successfully to Google Drive",
      report: {
        id: report.id,
        created_at: report.created_at,
        gdrive_file_url: report.gdrive_file_url,
        gdrive_file_id: googleDriveFile.id,
        file_name: report.file_name,
        patient_name: patient.full_name,
        session_type: session_type
      },
      subscription: {
        plan_id: subscription.plan_id,
        reports_limit: subscription.reports_limit,
        reports_used: incrementResult?.reports_used || subscription.reports_used + 1,
        reports_remaining: incrementResult?.reports_remaining || subscription.reports_limit - (subscription.reports_used + 1),
        status: incrementResult?.status || subscription.status
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 201,
    });

  } catch (error) {
    console.error('Error in save-report function:', error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      message: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

/**
 * Creates a Google Doc in the user's Google Drive
 * @param accessToken Google OAuth access token
 * @param title Title of the document (standardized format)
 * @param content Content of the document
 * @returns GoogleDriveFile object or null if failed
 */
async function createGoogleDoc(
  accessToken: string, 
  title: string, 
  content: string
): Promise<GoogleDriveFile | null> {
  try {
    // First, create the document
    const createDocResponse = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title,
        body: {
          content: [
            {
              paragraph: {
                elements: [
                  {
                    textRun: {
                      content: content
                    }
                  }
                ]
              }
            }
          ]
        }
      })
    });

    if (!createDocResponse.ok) {
      console.error('Failed to create Google Doc:', await createDocResponse.text());
      return null;
    }

    const docData = await createDocResponse.json();
    const documentId = docData.documentId;

    // Get the file metadata from Drive API
    const driveResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${documentId}?fields=id,name,webViewLink,size`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    if (!driveResponse.ok) {
      console.error('Failed to get file metadata:', await driveResponse.text());
      return null;
    }

    const fileData = await driveResponse.json();
    
    return {
      id: fileData.id,
      name: fileData.name,
      webViewLink: fileData.webViewLink,
      size: fileData.size
    };

  } catch (error) {
    console.error('Error creating Google Doc:', error);
    return null;
  }
} 