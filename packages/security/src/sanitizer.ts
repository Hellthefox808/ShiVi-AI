/**
 * ShiVi X100+ Security — Prompt Injection Detector & Sanitizer
 * Standard: SAD v2.0 §30, TDA v1.1 §77
 */

export interface SecurityScanResult {
  safe: boolean;
  threatDetected?: string;
  sanitizedText: string;
}

export class PromptSanitizer {
  private static injectionPatterns: RegExp[] = [
    /ignore (all )?previous instructions/i,
    /system prompt override/i,
    /you are now in (dan|jailbreak) mode/i,
    /bypass (safety|security) policy/i,
    /<script[\s\S]*?>[\s\S]*?<\/script>/i,
    /drop table/i,
    /rm -rf/i,
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
   * Sanitize text output before context inclusion
   */
  public static sanitizeOutput(text: string): string {
    return text.replace(/<[\s\S]*?>/g, ''); // Strip potential HTML/script injections
  }
}
