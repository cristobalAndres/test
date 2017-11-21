export class ConsumerServiceField {
  id: number;
  key: string;
  name: string;
}

export class ConsumerServiceMetadata {
  id: number;
  value: string;
  consumer_service_id: number;
  consumer_service_field_id: number;
  consumer_service_field: ConsumerServiceField;
}

export class ConsumerService {
  id: number;
  name: string = '';
  active: boolean = true;
  slug: string = '';
  sector_id: number;
  consumer_service_metadata: ConsumerServiceMetadata[];

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
