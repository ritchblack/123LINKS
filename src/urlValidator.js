/**
 * URL Validation Utilities for 123Links Chrome Extension
 * Various methods to check if user input text is a valid URL/link
 */

class URLValidator {
  /**
   * Method 1: Using built-in URL constructor (Recommended)
   * Most reliable method for URL validation
   */
  static isValidURL(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  /**
   * Method 2: Using Regular Expression
   * Good for basic URL pattern matching
   */
  static isValidURLRegex(string) {
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i" // fragment locator
    );
    return !!urlPattern.test(string);
  }

  /**
   * Method 3: Enhanced URL validation with protocol checking
   * Validates URL and ensures it has a proper protocol
   */
  static isValidURLWithProtocol(string) {
    try {
      const url = new URL(string);
      return ["http:", "https:", "ftp:", "ftps:"].includes(url.protocol);
    } catch (_) {
      return false;
    }
  }

  /**
   * Method 4: Flexible URL validation (adds protocol if missing)
   * Attempts to validate URL and auto-adds protocol if missing
   */
  static isValidURLFlexible(string) {
    // First try as-is
    if (this.isValidURL(string)) {
      return { isValid: true, url: string };
    }

    // Try adding https:// if no protocol
    if (!string.match(/^https?:\/\//i)) {
      const withProtocol = "https://" + string;
      if (this.isValidURL(withProtocol)) {
        return { isValid: true, url: withProtocol };
      }
    }

    return { isValid: false, url: string };
  }

  /**
   * Method 5: Domain-only validation
   * Checks if input is a valid domain name
   */
  static isValidDomain(string) {
    const domainPattern =
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
    return domainPattern.test(string);
  }

  /**
   * Method 6: Comprehensive link detection
   * Detects various types of links including domains, IPs, and full URLs
   */
  static detectLinkType(string) {
    const trimmed = string.trim();

    // Check if it's a full URL
    if (this.isValidURL(trimmed)) {
      return { type: "full_url", isValid: true, value: trimmed };
    }

    // Check if it's a domain
    if (this.isValidDomain(trimmed)) {
      return { type: "domain", isValid: true, value: "https://" + trimmed };
    }

    // Check if it's an IP address
    if (this.isValidIP(trimmed)) {
      return { type: "ip", isValid: true, value: "http://" + trimmed };
    }

    // Check if it looks like a URL without protocol
    const flexibleResult = this.isValidURLFlexible(trimmed);
    if (flexibleResult.isValid) {
      return {
        type: "url_without_protocol",
        isValid: true,
        value: flexibleResult.url,
      };
    }

    return { type: "not_a_link", isValid: false, value: trimmed };
  }

  /**
   * Helper method: IP address validation
   */
  static isValidIP(string) {
    const ipPattern =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipPattern.test(string);
  }

  /**
   * Method 7: URL validation with additional checks
   * Validates URL and performs additional security/format checks
   */
  static validateURLSafely(string) {
    try {
      const url = new URL(string);

      // Check for valid protocols
      const validProtocols = ["http:", "https:", "ftp:", "ftps:"];
      if (!validProtocols.includes(url.protocol)) {
        return { isValid: false, error: "Invalid protocol" };
      }

      // Check for suspicious patterns
      if (url.hostname.includes("..") || url.hostname.startsWith(".")) {
        return { isValid: false, error: "Suspicious hostname" };
      }

      // Check hostname length
      if (url.hostname.length > 253) {
        return { isValid: false, error: "Hostname too long" };
      }

      return {
        isValid: true,
        url: url.href,
        protocol: url.protocol,
        hostname: url.hostname,
        pathname: url.pathname,
      };
    } catch (error) {
      return { isValid: false, error: error.message };
    }
  }

  /**
   * Method 8: Batch URL validation
   * Validates multiple URLs at once
   */
  static validateMultipleURLs(urls) {
    return urls.map((url) => ({
      original: url,
      ...this.detectLinkType(url),
    }));
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = URLValidator;
}

// Make available globally for browser use
if (typeof window !== "undefined") {
  window.URLValidator = URLValidator;
}
