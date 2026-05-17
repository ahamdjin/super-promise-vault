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
  const headers = new Headers(init?.headers);
  for (const [key, value] of Object.entries(corsHeaders(request))) {
    headers.set(key, value);
  }

  return NextResponse.json(body, {
    ...init,
    headers
  });
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function getString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function hasReadableTranscript(value: unknown) {
  const transcript = getString(value);
  if (transcript) return true;

  const transcriptRecord = asRecord(value);
  return Boolean(getString(transcriptRecord?.stitchedText));
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

  let capture: Record<string, unknown>;
  try {
    const parsed = await request.json();
    const parsedCapture = asRecord(parsed);
    if (!parsedCapture) {
      return json(request, { error: 'Capture payload must be a JSON object.' }, { status: 400 });
    }

    capture = parsedCapture;
  } catch {
    return json(request, { error: 'Invalid capture JSON.' }, { status: 400 });
  }

  const captureId = getString(capture.id);
  if (!captureId || !hasReadableTranscript(capture.transcript)) {
    return json(request, { error: 'Capture must include an id and transcript.' }, { status: 422 });
  }

  const context = asRecord(capture.context);
  const extraction = asRecord(capture.extraction);
  const provider = asRecord(capture.provider);

  const row = {
    user_id: user.id,
    extension_capture_id: captureId,
    company: getString(capture.company) || getString(context?.company),
    issue_title: getString(capture.issueTitle) || getString(context?.issueTitle),
    promised_outcome: getString(capture.promisedOutcome) || getString(extraction?.promisedOutcome),
    provider_name: getString(capture.providerName) || getString(provider?.name),
    source_url: getString(capture.pageUrl) || getString(context?.pageUrl),
    follow_up_at: getString(capture.followUpAt) || getString(context?.followUpAt),
    amount_label: getString(capture.amount) || getString(context?.amount),
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
