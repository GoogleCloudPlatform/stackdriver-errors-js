declare module 'stackdriver-errors-js' {
  /**
   * Context to be sent along with the error
   */
  interface Context {
    /**
     * User who caused or was affected by the error
     */
    userId?: string;

    [x: string]: any;
  }

  /**
   * Context to be sent along with the error
   */
  interface PayloadContext extends Context {
    httpRequest: {
      /**
       * Requesting agent
       */
      userAgent: string;

      /**
       * Website URL
       */
      url: string;
    };
  }

  /**
   * Service context
   */
  interface ServiceContext {
    /**
     * Name of the service reporting the error
     */
    service: string;

    /**
     * Version identifier of the service reporting the error
     */
    version: string;
  }

  /**
   * Payload passed to the custom reporting function
   */
  interface Payload {
    /**
     * Context related to this error
     */
    context: PayloadContext;

    /**
     * Error message
     */
    message: string;

    /**
     * Service context
     */
    serviceContext: ServiceContext;
  }

  /**
   * Initial configuration
   */
  interface InitialConfiguration {
    /**
     * Overwrite endpoint that errors are reported to.
     */
    targetUrl?: string;
    
    /**
     * The context in which the error occurred
     */
    context?: Context;

    /**
     * Custom function to be called with the error payload for reporting,
     * instead of HTTP request
     *
     * @param payload Error payload
     */
    customReportingFunction?: (payload: Payload) => Promise<void>;

    /**
     * Set to true to not send error reports, this can be used when
     * developing locally
     *
     * @default false
     */
    disabled?: boolean;

    /**
     * The API key to use to call the API
     */
    key: string;

    /**
     * The Google Cloud Platform project ID to report errors to
     */
    projectId: string;

    /**
     * Set to false to prevent reporting unhandled exceptions
     *
     * @default true
     */
    reportUncaughtExceptions?: boolean;

    /**
     * Set to false to prevent reporting unhandled promise rejections
     *
     * @default true
     */
    reportUnhandledPromiseRejections?: boolean;

    /**
     * Name of the service reporting the error
     *
     * @default "web"
     */
    service?: string;

    /**
     * Version identifier of the service reporting the error
     */
    version?: string;
  }

  /**
   * Error report options
   */
  interface ReportOptions {
    /**
     * Omit number of frames if creating stack
     *
     * @default 1
     */
    skipLocalFrames?: number;
  }

  /**
   * An Error handler that sends errors to the Stackdriver Error Reporting API
   */
  class StackdriverErrorReporter {
    /**
     * Initializes the client
     *
     * @param options Initial configuration
     */
    start(options: InitialConfiguration): void;

    /**
     * Report an error to the Stackdriver Error Reporting API
     *
     * @param error The Error object or message string to report
     * @param options Configuration for this report
     */
    report(error: string | Error, options?: ReportOptions): Promise<void>;

    /**
     * Set the user for the current context.
     *
     * @param user The unique identifier of the user (can be ID, email or
     * custom token) or undefined if not logged in
     */
    setUser(user?: string): void;
  }

  export default StackdriverErrorReporter;
}
