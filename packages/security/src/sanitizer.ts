/**
 * ShiVi X100+ Security — Prompt Injection Detector, PII Anonymizer & Sanitizer
 * Standard: SAD v2.0 §30, TDA v1.1 §77
 */

export interface SecurityScanResult {
  safe: boolean;
  threatDetected?: string;
  sanitizedText: string;
}

export interface PIIAnonymizationResult {
  anonymizedText: string;
  detectedPIICount: number;
  redactedFields: string[];
}

export class PromptSanitizer {
  private static injectionPatterns: RegExp[] = [
    /ignore (all )?previous instructions/i,
    /system prompt (override|leak|reveal)/i,
    /you are now in (dan|jailbreak|developer) mode/i,
    /bypass (safety|security|policy|guardrail)/i,
    /<script[\s\S]*?>[\s\S]*?<\/script>/i,
    /drop (table|database|schema)/i,
    /rm -rf/i,
    /secret_key_exfiltrate/i,
    /exfiltrate[_\s]credentials/i,
    /curl\s+http.*\|\s*sh/i,
  ];

  private static piiPatterns: Array<{ name: string; pattern: RegExp; replacement: string }> = [
    { name: 'SSN', pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[REDACTED_SSN]' },
    { name: 'CREDIT_CARD', pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, replacement: '[REDACTED_CC]' },
    { name: 'EMAIL', pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '[REDACTED_EMAIL]' },
    { name: 'PHONE', pattern: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, replacement: '[REDACTED_PHONE]' },
    { name: 'API_KEY', pattern: /\b(sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36}|AIza[0-9A-Za-z-_]{35})\b/g, replacement: '[REDACTED_API_KEY]' },
  ];

  /**
   * Scan prompt or model input for adversarial injection patterns
   */
  public static scanInput(text: string): SecurityScanResult {
    for (const pattern of this.injectionPatterns) {
      if (pattern.test(text)) {
        return {
          safe: false,
          threatDetected: `Adversarial pattern detected matching '${pattern.source}'`,
          sanitizedText: text.replace(pattern, '[REDACTED_ADVERSARIAL_INPUT]'),
        };
      }
    }

    return {
      safe: true,
      sanitizedText: text,
    };
  }

  /**
   * Anonymize and redact PII fields before sending context to LLMs
   */
  public static anonymizePII(text: string): PIIAnonymizationResult {
    let result = text;
    let count = 0;
    const redactedFields: string[] = [];

    for (const pii of this.piiPatterns) {
      const matches = text.match(pii.pattern);
      if (matches && matches.length > 0) {
        count += matches.length;
        redactedFields.push(pii.name);
        result = result.replace(pii.pattern, pii.replacement);
      }
    }

    return {
      anonymizedText: result,
      detectedPIICount: count,
      redactedFields,
    };
  }

  /**
   * Sanitize text output before context inclusion
   */
  public static sanitizeOutput(text: string): string {
    return text.replace(/<[\s\S]*?>/g, ''); // Strip potential HTML/script injections
  }
}

