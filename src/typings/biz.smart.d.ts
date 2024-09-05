declare namespace BizSmart {
  type SmartRecordType = {
    tid: string;
    title: string;
    content: string;
    extra?: Record<string, any>;
    datetime: number;
  } & Record<string, any>;
}
