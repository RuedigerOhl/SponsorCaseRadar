import { NextRequest, NextResponse } from 'next/server';
import { analyzeSponsoringCase } from '@/lib/claude';
import { calculateScore } from '@/lib/scoring';
import { createServiceClient } from '@/lib/supabase';

export const maxDuration = 120; // 2 minutes for Claude + web search

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    const description = formData.get('description') as string | null;
    const discoveredBy = formData.get('discovered_by') as string | null;
    const category = formData.get('category') as string | null;

    // Validate: at least one input required
    if (!image && !description) {
      return NextResponse.json(
        { error: 'Bitte lade ein Bild hoch oder beschreibe den Case.' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Handle image upload to Supabase Storage
    let photoUrl: string | null = null;
    let imageBase64: string | undefined;
    let imageMimeType: string | undefined;

    if (image && image.size > 0) {
      const imageBuffer = await image.arrayBuffer();
      const imageBytes = new Uint8Array(imageBuffer);

      // Convert to base64 for Claude
      imageBase64 = Buffer.from(imageBytes).toString('base64');
      imageMimeType = image.type || 'image/jpeg';

      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${image.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('case-images')
        .upload(fileName, imageBytes, {
          contentType: imageMimeType,
          upsert: false,
        });

      if (uploadError) {
        console.error('Image upload error:', uploadError);
        // Continue without image URL but still use base64 for Claude
      } else if (uploadData) {
        const { data: urlData } = supabase.storage
          .from('case-images')
          .getPublicUrl(uploadData.path);
        photoUrl = urlData.publicUrl;
      }
    }

    // Call Claude API for analysis
    const analysis = await analyzeSponsoringCase(
      description || undefined,
      imageBase64,
      imageMimeType
    );

    // Calculate total score and label
    const { total: scoreTotal, label: scoreLabel } = calculateScore(analysis.ratings);

    // Save to Supabase database
    const { data: caseData, error: dbError } = await supabase
      .from('cases')
      .insert({
        title: analysis.title,
        brand: analysis.brand,
        partner: analysis.partner,
        category: category || null,
        photo_url: photoUrl,
        description_input: description || null,
        summary: analysis.summary,
        discovered_by: discoveredBy || null,
        score_total: scoreTotal,
        score_label: scoreLabel,
        ratings: analysis.ratings,
        rating_reasons: analysis.rating_reasons,
        strategic_insight: analysis.strategic_insight,
        sources: analysis.sources,
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Fehler beim Speichern des Cases. Bitte versuche es erneut.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: caseData.id,
      score_total: scoreTotal,
      score_label: scoreLabel,
    });
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Ein unbekannter Fehler ist aufgetreten. Bitte versuche es erneut.',
      },
      { status: 500 }
    );
  }
}
