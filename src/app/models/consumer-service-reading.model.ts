export class Readings {
  id: number;
  current: number;
  prev: number;
  period: number;
  amount: number;
}

export class ConsumerServiceReading {
  id: number;
  name: string = '';
  mt2: number;
  floor: string;
  active: boolean = true;
  slug: string = '';
  current_readings: Readings[];
  prev_readings: Readings[];

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}


export class ConsumerServiceReadingView {
  id: number;
  name: string = '';
  mt2: number;
  floor: string;
  active: boolean = true;
  slug: string = '';
  current_reading: number;
  prev_reading: number;
  consumption: number;
  is_current_reading: number;
  amount: number;
  reading_id: number;

  reading: ConsumerServiceReading;

  constructor(reading: ConsumerServiceReading) {
    this.reading = reading;
    this.parse(this.reading);
  }

  formatNumber(val): number {
    return Number(Number(val).toFixed(2));
  }

  parse(reading: ConsumerServiceReading): void {
    this.id = reading.id;
    this.name = reading.name;
    this.mt2 = reading.mt2;
    this.floor = reading.floor;
    this.active = reading.active;
    this.slug = reading.slug;
    this.consumption = 0;
    this.is_current_reading = 0;
    this.current_reading = 0;
    this.prev_reading = 0;
    this.amount = 0;

    if (reading.current_readings.length === 0) {
      if (reading.prev_readings.length > 0) {
        this.current_reading = this.formatNumber(reading.prev_readings[0].current);
        this.prev_reading = this.formatNumber(reading.prev_readings[0].current);
        this.reading_id = null;
        this.amount = this.formatNumber(reading.prev_readings[0].amount);
      }
    } else {
      this.is_current_reading = 1;
      this.current_reading = this.formatNumber(reading.current_readings[0].current);
      this.prev_reading = this.formatNumber(reading.current_readings[0].prev);
      this.reading_id = this.formatNumber(reading.current_readings[0].id);
      this.amount = this.formatNumber(reading.current_readings[0].amount);
    }
    this.consumption = this.current_reading - this.prev_reading;


  }

}
