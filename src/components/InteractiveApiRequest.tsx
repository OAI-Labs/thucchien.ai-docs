import React, { useState, useEffect } from 'react';
import AutoResizingTextarea from './AutoResizingTextarea';
import InlineEditableCodeBlock from './InlineEditableCodeBlock';
import styles from './InlineEditableCodeBlock.module.css';
import reqStyles from './InteractiveApiRequest.module.css';
import CodeBlock from '@theme/CodeBlock';
import CopyableCodeBlock from './CopyableCodeBlock';
import ReactMarkdown from 'react-markdown';

// --- PROPS DEFINITION ---
interface ParameterControl {
  type: 'input' | 'select' | 'textarea';
  options?: string[];
}

interface InteractiveApiRequestProps {
  apiUrl: string;
  method?: 'POST' | 'GET' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  initialParameters: Record<string, any>;
  parameterControls: Record<string, ParameterControl>;
  codeTemplates: Record<string, { language: string; template: string }>;
  buildBody: (params: Record<string, any>) => Record<string, any>;
  exampleResponse: Record<string, any>;
  isMarkdownResponse?: boolean;
  customPreview?: (response: any, parameters: Record<string, any>) => React.ReactNode;
}

// --- COMPONENT ---
export default function InteractiveApiRequest({
  apiUrl,
  method = 'POST',
  headers = { 'Content-Type': 'application/json' },
  initialParameters,
  parameterControls,
  codeTemplates,
  buildBody,
  exampleResponse,
  isMarkdownResponse,
  customPreview,
}: InteractiveApiRequestProps) {
  const [parameters, setParameters] = useState(initialParameters);
  const [selectedTemplate, setSelectedTemplate] = useState(Object.keys(codeTemplates)[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup function to revoke object URLs to prevent memory leaks
    return () => {
      if (videoPreviewUrl) {
        window.URL.revokeObjectURL(videoPreviewUrl);
      }
      if (audioPreviewUrl) {
        window.URL.revokeObjectURL(audioPreviewUrl);
      }
      if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
        window.URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [videoPreviewUrl, audioPreviewUrl, imagePreviewUrl]);

  const handleParameterChange = (key, value) => {
    setParameters((prevParams) => ({
      ...prevParams,
      [key]: value,
    }));
  };

  const handleExecute = async () => {
    setIsLoading(true);
    setResponse(null);
    setError(null);
    setVideoPreviewUrl(null);
    setAudioPreviewUrl(null);
    setImagePreviewUrl(null);
    setMarkdownContent(null);

    const finalHeaders = { ...headers };
    if (parameters.apiKey) {
      if (headers['x-goog-api-key'] !== undefined) {
        finalHeaders['x-goog-api-key'] = parameters.apiKey;
      } else {
        finalHeaders['Authorization'] = `Bearer ${parameters.apiKey}`;
      }
    }

    let finalApiUrl = apiUrl;
    for (const key in parameters) {
      finalApiUrl = finalApiUrl.replace(new RegExp(`{{${key}}}`, 'g'), parameters[key]);
    }

    try {
      const fetchOptions: RequestInit = {
        method: method,
        headers: finalHeaders,
      };

      if (method !== 'GET' && buildBody) {
        const body = buildBody(parameters);
        if (body) {
          fetchOptions.body = JSON.stringify(body);
        }
      }

      const res = await fetch(finalApiUrl, fetchOptions);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error: ${res.status} ${res.statusText} - ${errorText}`);
      }

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setResponse(data);

        if (isMarkdownResponse) {
          const content = data?.choices?.[0]?.message?.content;
          if (content) {
            setMarkdownContent(content);
          }
        }

        // Check for image data for preview
        let base64ImageData = null;
        let imageMimeType = 'image/png';

        // Case 1: Standard Image Generation API (/images/generations)
        if (data?.data?.[0]?.b64_json) {
          base64ImageData = data.data[0].b64_json;
        }
        // Case 2: Chat Completions with image modality
        else if (data?.choices?.[0]?.message?.images?.[0]?.image_url?.url) {
          const dataUrl = data.choices[0].message.images[0].image_url.url;
          // It's a data URL, can be used directly in src
          setImagePreviewUrl(dataUrl);
        }
        // Case 3: Gemini Image Generation API - check all parts for inline image data
        else if (data?.candidates?.[0]?.content?.parts) {
          const parts = data.candidates[0].content.parts;
          for (const part of parts) {
            if (part?.inlineData?.data && part.inlineData.mimeType.startsWith('image/')) {
              base64ImageData = part.inlineData.data;
              imageMimeType = part.inlineData.mimeType;
              break;
            }
          }
        }

        if (base64ImageData) {
          try {
            const byteCharacters = atob(base64ImageData);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: imageMimeType });
            const url = window.URL.createObjectURL(blob);
            setImagePreviewUrl(url);
          } catch (e) {
            console.error("Error decoding base64 image:", e);
          }
        }

        // Check for Gemini TTS audio data in the response
        const audioData = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        const mimeType = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType;

        if (audioData && mimeType && mimeType.startsWith('audio/L16')) {
          // It's raw PCM data, we need to wrap it in a WAV header to make it playable
          const rateMatch = mimeType.match(/rate=(\d+)/);
          const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000; // Default to 24000Hz if not specified

          const decodedData = atob(audioData);
          const pcmData = new Uint8Array(decodedData.length);
          for (let i = 0; i < decodedData.length; i++) {
            pcmData[i] = decodedData.charCodeAt(i);
          }

          const wavBlob = pcmToWav(pcmData, 1, sampleRate, 16);
          const url = window.URL.createObjectURL(wavBlob);
          setAudioPreviewUrl(url);
        }
      } else {
        setResponse(null);
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);

        // If the content is a video, create a preview URL
        if (blob.type.startsWith('video/')) {
          setVideoPreviewUrl(url);
        } else if (blob.type.startsWith('audio/')) {
          setAudioPreviewUrl(url);
        }

        // Trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = blob.type.startsWith('video/') ? 'generated_video.mp4' : 'generated_audio.mp3';
        document.body.appendChild(a);
        a.click();
        a.remove();
        // The object URL is not revoked here because it's needed for the preview.
        // The useEffect hook will handle cleanup.
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate replacements for the code block
  const replacements = Object.keys(parameterControls).reduce((acc, key) => {
    const control = parameterControls[key];
    if (control.type === 'input') {
      const value = parameters[key] || '';
      const width = Math.max(5, Math.min(value.length, 40)) + 2;
      acc[key] = (
        <input
          type="text"
          value={value}
          onChange={(e) => handleParameterChange(key, e.target.value)}
          className={styles.inlineInput}
          style={{ width: `${width}ch` }}
        />
      );
    } else if (control.type === 'textarea') {
      acc[key] = (
        <AutoResizingTextarea
          value={parameters[key]}
          onChange={(e) => handleParameterChange(key, e.target.value)}
          className={styles.inlineInput}
        />
      );
    } else if (control.type === 'select' && control.options) {
      acc[key] = (
        <select
          value={parameters[key]}
          onChange={(e) => handleParameterChange(key, e.target.value)}
          className={styles.inlineSelect}
        >
          {control.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }
    return acc;
  }, {});

  // Generate final code for each template
  const finalCodes = Object.keys(codeTemplates).reduce((acc, key) => {
    let finalCode = codeTemplates[key].template;
    for (const paramKey in parameters) {
      // Basic escaping for strings in code
      const value = typeof parameters[paramKey] === 'string'
        ? parameters[paramKey].replace(/"/g, '\\"')
        : parameters[paramKey];
      finalCode = finalCode.replace(new RegExp(`{{${paramKey}}}`, 'g'), value);
    }
    acc[key] = finalCode;
    return acc;
  }, {});

  const currentTemplate = codeTemplates[selectedTemplate];

  const jsonReplacer = (key, value) => {
    if (typeof value === 'string' && value.length > 200) {
      return value.substring(0, 50) + '... [TRUNCATED] ...' + value.substring(value.length - 50);
    }
    return value;
  };

  // Helper function to create a WAV file from raw PCM data
  const pcmToWav = (pcmData, numChannels, sampleRate, bitsPerSample) => {
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;
    const dataSize = pcmData.length;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    // "fmt " sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    // "data" sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write PCM data
    for (let i = 0; i < dataSize; i++) {
      view.setUint8(44 + i, pcmData[i]);
    }

    return new Blob([view], { type: 'audio/wav' });
  };

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  return (
    <div className={reqStyles.container}>
       <div className={reqStyles.selectContainer}>
        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          className={reqStyles.languageSelect}
        >
          {Object.keys(codeTemplates).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>
      <InlineEditableCodeBlock
        key={selectedTemplate}
        language={currentTemplate.language}
        code={currentTemplate.template}
        finalCode={finalCodes[selectedTemplate]}
        replacements={replacements}
        onExecute={handleExecute}
        isLoading={isLoading}
      />
      {isLoading && (
        <div className={reqStyles.loading}>
          <div className={reqStyles.spinner}></div>
        </div>
      )}
      {error && (
        <div className={reqStyles.error}>
          <div className={reqStyles.errorTitle}>⚠️ Error</div>
          <div className={reqStyles.errorMessage}>{error}</div>
        </div>
      )}
      {response && (
        <div className={reqStyles.responseContainer}>
          {customPreview && (
            <div className={reqStyles.customPreviewContainer}>
              {customPreview(response, parameters)}
            </div>
          )}
          <CopyableCodeBlock
            language="json"
            title="Response"
            fullCode={JSON.stringify(response, null, 2)}
            truncatedCode={JSON.stringify(response, jsonReplacer, 2)}
          />
          {markdownContent && (
            <div className={reqStyles.markdownPreviewContainer}>
              <h3 className={reqStyles.responseTitle}>Preview</h3>
              <div className={reqStyles.markdownPreview}>
                <ReactMarkdown>{markdownContent}</ReactMarkdown>
              </div>
            </div>
          )}
          {imagePreviewUrl && (
            <div className={reqStyles.imagePreviewContainer}>
              <h3 className={reqStyles.responseTitle}>Image Preview</h3>
              <img src={imagePreviewUrl} alt="Generated Image" className={reqStyles.imagePreview} />
            </div>
          )}
        </div>
      )}
      {videoPreviewUrl && (
        <div>
          <h3 className={reqStyles.responseTitle}>Video Preview</h3>
          <video src={videoPreviewUrl} controls className={reqStyles.videoPreview} />
        </div>
      )}
      {audioPreviewUrl && (
        <div>
          <h3 className={reqStyles.responseTitle}>Audio Preview</h3>
          <audio src={audioPreviewUrl} controls className={reqStyles.audioPreview} />
        </div>
      )}
      {!isLoading && !error && !response && !videoPreviewUrl && !audioPreviewUrl && !imagePreviewUrl && exampleResponse && (
        <CopyableCodeBlock
          language="json"
          title="Example Response"
          fullCode={JSON.stringify(exampleResponse, null, 2)}
          truncatedCode={JSON.stringify(exampleResponse, jsonReplacer, 2)}
        />
      )}
    </div>
  );
}
