declare module "*.scss";

interface Window {
  clickTab: (tabId: string) => void;
}

declare let enabledFeatures: { [key: string]: boolean };
declare let depmapContactUrl: string;
declare let errorHandler: { report: (message: string) => void };

declare module "shallow-with-context";
