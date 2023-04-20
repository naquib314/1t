import * as React from "react";

type Props = {
  // No props at the moment
};

type State = {
  error: Error;
  errorInfo: React.ErrorInfo;
};

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Catch errors in any components below and re-render with error message
    errorHandler.report(error.stack);

    this.setState({
      error,
      errorInfo,
    });
  }

  componentDidUpdate(_: Props, prevState: State) {
    // Allow recovering from errors in development mode.
    if (process.env.NODE_ENV === "development" && prevState.error !== null) {
      this.setState({ error: null, errorInfo: null });
    }
  }

  render() {
    if (this.state.errorInfo) {
      // Error path
      return (
        <div style={{ textAlign: "center" }}>
          <h1>An internal error occurred</h1>
          <p>
            Sorry, something went wrong on our system. We have been notified and
            will be fixing it.
          </p>
          <p>
            If you would like to help fix this error, you can help by{" "}
            <a
              target="_blank"
              rel="noreferrer noopener"
              href={`${depmapContactUrl}`}
            >
              telling us what happened before this error
            </a>
            .
          </p>
        </div>
      );
    }
    // Normally, just render children
    return this.props.children;
  }
}

export default ErrorBoundary;
