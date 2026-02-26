declare module 'useragent-parser-js' {
    interface GeoIP {
      [key: string]: string;
    }
  
    interface UserAgent {
      isMobile: boolean;
      isTablet: boolean;
      isiPad: boolean;
      isiPod: boolean;
      isiPhone: boolean;
      isAndroid: boolean;
      isBlackberry: boolean;
      isOpera: boolean;
      isIE: boolean;
      isIECompatibilityMode: boolean;
      isSafari: boolean;
      isFirefox: boolean;
      isWebkit: boolean;
      isChrome: boolean;
      isKonqueror: boolean;
      isOmniWeb: boolean;
      isSeaMonkey: boolean;
      isFlock: boolean;
      isAmaya: boolean;
      isEpiphany: boolean;
      isDesktop: boolean;
      isWindows: boolean;
      isLinux: boolean;
      isLinux64: boolean;
      isMac: boolean;
      isChromeOS: boolean;
      isBada: boolean;
      isSamsung: boolean;
      isRaspberry: boolean;
      isBot: boolean;
      isCurl: boolean;
      isAndroidTablet: boolean;
      isWinJs: boolean;
      isKindleFire: boolean;
      isSilk: boolean;
      silkAccelerated: boolean;
      browser: string;
      version: string;
      os: string;
      platform: string;
      geoIP: GeoIP;
      source: string;
      isWindowsPhone?: boolean;
      isiSamsung?: boolean;
    }
  
    interface UserAgentParser {
      version: string;
      agent: UserAgent;
      defaultAgent: UserAgent;
      
      getBrowser(userAgentString: string): string;
      getBrowserVersion(userAgentString: string): string;
      getOS(userAgentString: string): string;
      getPlatform(userAgentString: string): string;
      
      testCompatibilityMode(): void;
      testSilk(): string | false;
      testKindleFire(): string | false;
      reset(): UserAgentParser;
      testMobile(): void;
      testTablet(): void;
      testNginxGeoIP(headers: Record<string, string>): void;
      testBot(): void;
      testAndroidTablet(): void;
      
      parse(userAgentString: string): UserAgent;
    }
  
    const userAgentParser: UserAgentParser;
    export = userAgentParser;
  }