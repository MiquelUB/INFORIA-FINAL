-- Create universal search function (RPC)
-- This function searches across patients, reports, and appointments

CREATE OR REPLACE FUNCTION search_all(search_term TEXT)
RETURNS TABLE (
    id UUID,
    type TEXT,
    title TEXT,
    subtitle TEXT,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    relevance_score INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Search in patients table
    RETURN QUERY
    SELECT 
        p.id,
        'patient'::TEXT as type,
        p.name as title,
        p.email as subtitle,
        '/patients/' || p.id::TEXT as url,
        p.created_at,
        CASE 
            WHEN p.name ILIKE search_term THEN 100
            WHEN p.name ILIKE search_term || '%' THEN 90
            WHEN p.name ILIKE '%' || search_term || '%' THEN 80
            WHEN p.email ILIKE '%' || search_term || '%' THEN 70
            ELSE 50
        END as relevance_score
    FROM patients p
    WHERE p.user_id = auth.uid()
    AND (
        p.name ILIKE '%' || search_term || '%' OR
        p.email ILIKE '%' || search_term || '%'
    )
    
    UNION ALL
    
    -- Search in reports table
    SELECT 
        r.id,
        'report'::TEXT as type,
        r.file_name as title,
        'Informe guardado en Google Drive' as subtitle,
        r.gdrive_file_url as url,
        r.created_at,
        CASE 
            WHEN r.file_name ILIKE search_term THEN 100
            WHEN r.file_name ILIKE search_term || '%' THEN 90
            WHEN r.file_name ILIKE '%' || search_term || '%' THEN 80
            ELSE 50
        END as relevance_score
    FROM reports r
    WHERE r.user_id = auth.uid()
    AND r.file_name ILIKE '%' || search_term || '%'
    
    UNION ALL
    
    -- Search in appointments table
    SELECT 
        a.id,
        'appointment'::TEXT as type,
        a.title as title,
        'Cita programada para ' || to_char(a.start_time, 'DD/MM/YYYY HH24:MI') as subtitle,
        '/calendar?date=' || to_char(a.start_time, 'YYYY-MM-DD') as url,
        a.created_at,
        CASE 
            WHEN a.title ILIKE search_term THEN 100
            WHEN a.title ILIKE search_term || '%' THEN 90
            WHEN a.title ILIKE '%' || search_term || '%' THEN 80
            WHEN a.description ILIKE '%' || search_term || '%' THEN 70
            ELSE 50
        END as relevance_score
    FROM appointments a
    WHERE a.user_id = auth.uid()
    AND (
        a.title ILIKE '%' || search_term || '%' OR
        COALESCE(a.description, '') ILIKE '%' || search_term || '%'
    )
    
    ORDER BY relevance_score DESC, created_at DESC
    LIMIT 20;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_all(TEXT) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION search_all(TEXT) IS 'Universal search function that searches across patients, reports, and appointments. Returns results ordered by relevance score.';

-- Create a more advanced search function with fuzzy matching
CREATE OR REPLACE FUNCTION search_all_advanced(search_term TEXT)
RETURNS TABLE (
    id UUID,
    type TEXT,
    title TEXT,
    subtitle TEXT,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    relevance_score INTEGER,
    search_highlights TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    search_pattern TEXT;
BEGIN
    -- Create search pattern for better matching
    search_pattern := '%' || search_term || '%';
    
    -- Search in patients table with enhanced matching
    RETURN QUERY
    SELECT 
        p.id,
        'patient'::TEXT as type,
        p.name as title,
        p.email as subtitle,
        '/patients/' || p.id::TEXT as url,
        p.created_at,
        CASE 
            WHEN p.name ILIKE search_term THEN 100
            WHEN p.name ILIKE search_term || '%' THEN 95
            WHEN p.name ILIKE '%' || search_term || '%' THEN 85
            WHEN p.email ILIKE '%' || search_term || '%' THEN 75
            WHEN p.name ILIKE '%' || search_term || '%' THEN 65
            ELSE 50
        END as relevance_score,
        CASE 
            WHEN p.name ILIKE '%' || search_term || '%' THEN 
                'Paciente: ' || p.name
            ELSE 
                'Paciente: ' || p.name || ' (' || p.email || ')'
        END as search_highlights
    FROM patients p
    WHERE p.user_id = auth.uid()
    AND (
        p.name ILIKE search_pattern OR
        p.email ILIKE search_pattern
    )
    
    UNION ALL
    
    -- Search in reports table with enhanced matching
    SELECT 
        r.id,
        'report'::TEXT as type,
        r.file_name as title,
        'Informe guardado en Google Drive' as subtitle,
        r.gdrive_file_url as url,
        r.created_at,
        CASE 
            WHEN r.file_name ILIKE search_term THEN 100
            WHEN r.file_name ILIKE search_term || '%' THEN 95
            WHEN r.file_name ILIKE '%' || search_term || '%' THEN 85
            ELSE 50
        END as relevance_score,
        'Informe: ' || r.file_name as search_highlights
    FROM reports r
    WHERE r.user_id = auth.uid()
    AND r.file_name ILIKE search_pattern
    
    UNION ALL
    
    -- Search in appointments table with enhanced matching
    SELECT 
        a.id,
        'appointment'::TEXT as type,
        a.title as title,
        'Cita programada para ' || to_char(a.start_time, 'DD/MM/YYYY HH24:MI') as subtitle,
        '/calendar?date=' || to_char(a.start_time, 'YYYY-MM-DD') as url,
        a.created_at,
        CASE 
            WHEN a.title ILIKE search_term THEN 100
            WHEN a.title ILIKE search_term || '%' THEN 95
            WHEN a.title ILIKE '%' || search_term || '%' THEN 85
            WHEN COALESCE(a.description, '') ILIKE search_pattern THEN 75
            ELSE 50
        END as relevance_score,
        'Cita: ' || a.title || ' - ' || to_char(a.start_time, 'DD/MM/YYYY HH24:MI') as search_highlights
    FROM appointments a
    WHERE a.user_id = auth.uid()
    AND (
        a.title ILIKE search_pattern OR
        COALESCE(a.description, '') ILIKE search_pattern
    )
    
    ORDER BY relevance_score DESC, created_at DESC
    LIMIT 20;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_all_advanced(TEXT) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION search_all_advanced(TEXT) IS 'Advanced universal search function with fuzzy matching and search highlights. Returns results ordered by relevance score.'; 