import type { MeasurementProperty } from './heatpump';

export const UNIT_MAP: Record<string, string> = {
  'http://www.ontology-of-units-of-measure.org/resource/om-2/degreeCelsius': '°C',
  'http://www.ontology-of-units-of-measure.org/resource/om-2/kelvin': 'K',

  'http://www.ontology-of-units-of-measure.org/resource/om-2/kilowattHour': 'kWh',
  'http://www.ontology-of-units-of-measure.org/resource/om-2/megawattHour': 'MWh',
  'http://www.ontology-of-units-of-measure.org/resource/om-2/joule': 'J',

  'http://www.ontology-of-units-of-measure.org/resource/om-2/kilowatt': 'kW',
  'http://www.ontology-of-units-of-measure.org/resource/om-2/watt': 'W',

  'http://www.ontology-of-units-of-measure.org/resource/om-2/bar': 'bar',
  'http://www.ontology-of-units-of-measure.org/resource/om-2/pascal': 'Pa',

  'http://www.ontology-of-units-of-measure.org/resource/om-2/one': '',
};

export const PROPERTY_MAP: Record<string, MeasurementProperty> = {
  'https://www.tno.nl/building/ontology/heatpump-common-ontology#CurrentTemperature': 'roomTemperature',
  'https://www.tno.nl/building/ontology/heatpump-common-ontology#TemperatureSetpoint': 'temperatureSetpoint',
  'https://www.tno.nl/building/ontology/heatpump-common-ontology#COP': 'cop',
  'https://www.tno.nl/building/ontology/heatpump-common-ontology#ElectricityUse': 'energyUsage',
  'https://saref.etsi.org/saref4watr/FlowPressure': 'waterPressure',
};

export const PROPERTY_LABEL_MAP: Record<string, string> = {
  roomTemperature: 'Ruimtetemperatuur',
  temperatureSetpoint: 'Temperatuur setpoint',
  outsideTemperature: 'Buitentemperatuur',
  waterPressure: 'Waterdruk',
  cop: 'COP',
  energyUsage: 'Energieverbruik',
  supplyTemperature: 'Aanvoertemperatuur',
  returnTemperature: 'Retourtemperatuur',
  hotWaterTemperature: 'Warmwater',
  power: 'Vermogen',
};
