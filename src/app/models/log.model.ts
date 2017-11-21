export class Log {
  id: number;
  created_at: Date;
  event_log_status: EventLogStatus;
  event_log_type: EventLogType;
  event_log_values: EventLogValue[];

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

export class EventLogValue {
  id: number;
  value: any;
  event_log_field: EventLogField;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

export class EventLogField {
  id: number;
  key: string;
  name: string;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

export class EventLogStatus {
  id: number;
  status: string;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

export class EventLogType {
  id: number;
  type: string;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
