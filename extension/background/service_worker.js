const API_BASE = 'http://localhost:8000';

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'QUICK_ANALYZE') {
    // Fire-and-forget from content script bottle cap click
    analyzeUrl(msg.url, msg.videoId).then((data) => {
      if (sender.tab?.id && data && !data.error) {
        chrome.tabs.sendMessage(sender.tab.id, {
          type: 'ANALYZE_RESULT',
          score: data.reality_score,
          label: data.label,
          analysisId: data.id
        });
      }
    });
    return false;
  }

  if (msg.type === 'ANALYZE') {
    analyzeUrl(msg.url, msg.videoId).then(sendResponse);
    return true; // keep channel open for async response
  }

  if (msg.type === 'QUEUE_NOTARY') {
    queueNotary(msg.url, msg.videoId, msg.analysisId).then(sendResponse);
    return true;
  }
});

async function analyzeUrl(url, videoId) {
  try {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, video_id: videoId ?? null })
    });
    return await res.json();
  } catch (err) {
    console.error('[ALE] /analyze failed:', err);
    return { error: 'Could not reach ALE API. Is it running?' };
  }
}

async function queueNotary(url, videoId, analysisId) {
  try {
    const res = await fetch(`${API_BASE}/queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, video_id: videoId ?? null, analysis_id: analysisId ?? null })
    });
    return await res.json();
  } catch (err) {
    console.error('[ALE] /queue failed:', err);
    return { error: 'Could not reach ALE API. Is it running?' };
  }
}
