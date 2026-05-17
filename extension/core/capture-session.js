(function bootstrapCaptureSession(global) {
  function createTranscriptChunk({
    index,
    sourceType,
    text,
    rect = null,
    screenshotRef = null,
    confidence = 0.6
  }) {
    return {
      id: global.SPV.createId("chunk"),
      index,
      sourceType,
      text: global.SPV.cleanText(text),
      rect,
      screenshotRef,
      confidence
    }
  }

  function createAttachmentRecord(attachment, index) {
    return {
      id: global.SPV.createId(`attachment-${index}`),
      kind: attachment.kind || "file",
      label: global.SPV.cleanText(attachment.label || "Attachment"),
      url: attachment.url || "",
      source: attachment.source || "dom",
      confidence: attachment.confidence ?? 0.65
    }
  }

  function createCaptureSession({
    pageContext,
    pageProof,
    formValues,
    strategy,
    providerAdapter
  }) {
    const createdAt = global.SPV.isoNow()
    const transcriptText = pageContext?.transcript || pageContext?.selection || ""
    const transcriptChunks = transcriptText
      ? [
          createTranscriptChunk({
            index: 0,
            sourceType: pageContext?.transcript ? "dom" : "selection",
            text: transcriptText,
            rect: pageContext?.proofTargetRect || null,
            screenshotRef: pageProof?.filename || null,
            confidence: pageContext?.transcript ? 0.85 : 0.55
          })
        ]
      : []

    const attachments = (pageContext?.attachments || []).map((attachment, index) =>
      createAttachmentRecord(attachment, index)
    )

    const session = {
      version: 1,
      id: global.SPV.createId("session"),
      status: "draft",
      createdAt,
      updatedAt: createdAt,
      provider: {
        id: providerAdapter.id,
        name: providerAdapter.name
      },
      capabilities: providerAdapter.capabilities,
      strategy,
      context: {
        company: formValues.company,
        caseId: formValues.caseId,
        issueTitle: formValues.issueTitle,
        amount: formValues.amount,
        followUpAt: formValues.followUpAt,
        pageTitle: formValues.pageTitle,
        pageUrl: formValues.pageUrl
      },
      extraction: {
        promisedOutcome: formValues.promisedOutcome,
        internalNote: formValues.internalNote,
        supportSurface: pageContext?.supportSurface || "weak"
      },
      transcript: {
        chunks: transcriptChunks,
        stitchedText: transcriptChunks.map((chunk) => chunk.text).join("\n"),
        needsMoreCapture: strategy.mode !== "dom-complete",
        ocrText: ""
      },
      assets: {
        proofs: pageProof ? [pageProof] : [],
        attachments
      },
      raw: {
        selection: pageContext?.selection || "",
        issueTitleGuess: pageContext?.issueTitleGuess || "",
        proofTargetRect: pageContext?.proofTargetRect || null
      }
    }

    return {
      ...session,
      provider: session.provider,
      providerName: session.provider.name,
      supportSurface: session.extraction.supportSurface,
      company: session.context.company,
      caseId: session.context.caseId,
      issueTitle: session.context.issueTitle,
      promisedOutcome: session.extraction.promisedOutcome,
      amount: session.context.amount,
      followUpAt: session.context.followUpAt,
      internalNote: session.extraction.internalNote,
      transcript: session.transcript.stitchedText,
      attachments: session.assets.attachments,
      proof: session.assets.proofs[0] || null,
      pageUrl: session.context.pageUrl
    }
  }

  global.SPV = {
    ...global.SPV,
    createTranscriptChunk,
    createAttachmentRecord,
    createCaptureSession
  }
})(globalThis)
