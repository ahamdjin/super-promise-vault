import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function corsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  const isAllowedOrigin =
    origin.startsWith('chrome-extension://') ||
    origin === 'http://localhost:3000' ||
    origin === 'https://super-promise-vault.vercel.app';

  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : 'https://super-promise-vault.vercel.app',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    Vary: 'Origin'
  };
}

function json(request: NextRequest, body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...corsHeaders(request),
      ...(init?.headers || {})
    }
  });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request)
  });
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return json(request, { error: 'Sign in to Support Promise Vault before syncing extension captures.' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('support_captures')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return json(
      request,
      {
        error: 'Support captures table is not ready yet.',
        details: error.message
      },
      { status: 503 }
    );
  }

  return json(request, { captures: data || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return json(request, { error: 'Sign in to Support Promise Vault before syncing extension captures.' }, { status: 401 });
  }

  let capture: any;
  try {
    capture = await request.json();
  } catch {
    return json(request, { error: 'Invalid capture JSON.' }, { status: 400 });
  }

  if (!capture?.id || !capture?.transcript) {
    return json(request, { error: 'Capture must include an id and transcript.' }, { status: 422 });
  }

  const row = {
    user_id: user.id,
    extension_capture_id: capture.id,
    company: capture.company || capture.context?.company || null,
    issue_title: capture.issueTitle || capture.context?.issueTitle || null,
    promised_outcome: capture.promisedOutcome || capture.extraction?.promisedOutcome || null,
    provider_name: capture.providerName || capture.provider?.name || null,
    source_url: capture.pageUrl || capture.context?.pageUrl || null,
    follow_up_at: capture.followUpAt || capture.context?.followUpAt || null,
    amount_label: capture.amount || capture.context?.amount || null,
    capture
  };

  const { data, error } = await supabase
    .from('support_captures')
    .upsert(row, {
      onConflict: 'user_id,extension_capture_id'
    })
    .select()
    .single();

  if (error) {
    return json(
      request,
      {
        error: 'Could not save extension capture. Confirm the support_captures migration is applied.',
        details: error.message
      },
      { status: 503 }
    );
  }

  return json(request, { capture: data }, { status: 201 });
}
