export class Settings {
  id: number;
  value: string = '';
  community_settings_field: CommunitySettingsField;
  period: string = '';
  month: string = '';

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}

export class CommunitySettingsField {
  id: number;
  key: string;
  name: string;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
