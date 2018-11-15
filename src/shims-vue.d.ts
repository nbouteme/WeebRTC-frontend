declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

declare let BUILD: 'development' | 'production' | undefined;

declare type TransferArgs = {
  encrypted: boolean;
  key: string;
  long: boolean;
}
