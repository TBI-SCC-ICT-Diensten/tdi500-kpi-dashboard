export const SPARQL_LIST_HEATPUMPS = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX hco: <https://www.tno.nl/building/ontology/heatpump-common-ontology#>
PREFIX saref: <https://saref.etsi.org/core/>

SELECT ?heatpump ?id
WHERE {
  ?heatpump rdf:type hco:HeatPump .
  OPTIONAL { ?heatpump saref:hasIdentifier ?id . }
}
`;

/** @deprecated Use fetchAllHeatPumpData() from hupieApi.ts instead.
 *  This query times out on the Hupie endpoint due to 11 OPTIONAL blocks.
 *  Also contains two known bugs: ?heatpump/?heatPump casing mismatch and
 *  malformed energy use OPTIONAL block. */
export const SPARQL_ALL_HEATPUMP_DATA = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
PREFIX om: <http://www.ontology-of-units-of-measure.org/resource/om-2/> 
PREFIX hco: <https://www.tno.nl/building/ontology/heatpump-common-ontology#>
PREFIX saref: <https://saref.etsi.org/core/> 
PREFIX saref4bldg: <https://saref.etsi.org/saref4bldg/> 
PREFIX bot: <https://w3id.org/bot#>
PREFIX saref4watr: <https://saref.etsi.org/saref4watr/>

SELECT ?heatpump ?building ?room ?currentTemperature ?temperatureSetpoint ?outside ?flowPressure ?observation ?startDateTime ?endDateTime ?state ?cop ?energyUse ?heatingCurve ?baseValue ?baseUnit ?baseResult ?slopeValue ?slopeUnit ?slopeResult ?internetConnectionStateValue ?connectionstateServer ?errorCodeValue ?errorCodeMessage ?errorCodeSeverity ?result ?value ?unit  
WHERE { 
    ?heatpump rdf:type hco:HeatPump .
    OPTIONAL{
        ?heatPump rdf:type hco:HeatPump ; saref:hasIdentifier ?id . ?building rdf:type saref4bldg:Building ; saref4bldg:contains ?heatPump ; saref4bldg:hasSpace ?room . ?room rdf:type saref4bldg:BuildingSpace, saref:FeatureOfInterest; saref:hasPropertyOfInterest ?currentTemperature . ?currentTemperature rdf:type saref:PropertyOfInterest ; saref:hasPropertyKind hco:CurrentTemperature . ?heatPump saref:madeExecution ?observation . ?observation rdf:type hco:LatestObservation ; saref:observes ?room, ?currentTemperature ; saref:hasResult ?result . ?result rdf:type saref:PropertyValue ; saref:isValueOfProperty ?currentTemperature ; saref:hasValue ?value ; saref:isMeasuredIn ?unit .    
    } 
    OPTIONAL {
        ?heatPump rdf:type hco:HeatPump ; saref:hasIdentifier ?id ; saref:hasPropertyOfInterest ?temperatureSetpoint .
        ?temperatureSetpoint rdf:type saref:PropertyOfInterest ; saref:hasPropertyKind hco:TemperatureSetpoint .
        ?building rdf:type saref4bldg:Building ; saref4bldg:contains ?heatPump ; saref4bldg:hasSpace ?room .
        ?room rdf:type saref4bldg:BuildingSpace .
        ?heatPump saref:madeExecution ?observation .
        ?observation rdf:type hco:LatestObservation ; saref:observes ?heatPump, ?temperatureSetpoint ; saref:hasResult ?result .
        ?result rdf:type saref:PropertyValue ; saref:isValueOfProperty ?temperatureSetpoint ; saref:consistsOf ?room ; saref:consistsOf ?temperatureResult .
        ?temperatureResult rdf:type saref:PropertyValue ; saref:hasValue ?value ; saref:isMeasuredIn ?unit .
    }
    OPTIONAL {
        ?heatPump rdf:type hco:HeatPump . ?heatPump saref:hasIdentifier ?id .
        ?outside rdf:type bot:Zone, saref:FeatureOfInterest . ?outside saref:hasPropertyOfInterest ?currentTemperature .
        ?outside bot:hasBuilding ?building . ?building rdf:type saref4bldg:Building . ?building saref4bldg:contains ?heatPump .
        ?currentTemperature rdf:type saref:PropertyOfInterest . ?currentTemperature saref:hasPropertyKind hco:CurrentTemperature .
        ?heatPump saref:madeExecution ?observation . ?observation rdf:type hco:LatestObservation .
        ?observation saref:observes ?outside, ?currentTemperature . ?observation saref:hasResult ?result .
        ?result rdf:type saref:PropertyValue . ?result saref:isValueOfProperty ?currentTemperature . ?result saref:hasValue ?value . ?result saref:isMeasuredIn ?unit .
    }
    OPTIONAL {
        ?heatPump rdf:type hco:HeatPump ; saref:consistsOf ?waterAsset .
        ?waterAsset rdf:type hco:HeatPumpWaterAsset ; saref:hasPropertyOfInterest ?flowPressure .
        ?flowPressure rdf:type saref:PropertyOfInterest ; saref:hasPropertyKind saref4watr:FlowPressure .
        ?heatPump saref:madeExecution ?observation .
        ?observation rdf:type saref:Observation ; saref:observes ?waterAsset, ?flowPressure ; saref:hasResult ?result .
        ?result rdf:type saref:PropertyValue ; saref:isValueOfProperty ?flowPressure ; saref:hasValue ?value ; saref:isMeasuredIn ?unit .
    }
    OPTIONAL {
        ?heatPump rdf:type hco:Heatpump . ?heatPump saref:hasIdentifier ?id . 
        ?state rdf:type ?stateType . ?heatPump saref:hasState ?state . 
        ?state hco:hasStartTime ?startDateTime . ?state hco:hasEndTime ?endDateTime .     
    }
    OPTIONAL {
        ?heatPump rdf:type hco:HeatPump . ?heatPump saref:hasIdentifier ?id .
        ?heatPump saref:hasPropertyOfInterest ?cop . ?cop rdf:type saref:PropertyOfInterest . ?cop saref:hasPropertyKind hco:COP .
        ?heatPump saref:madeExecution ?observation . ?observation rdf:type saref:Observation .
        ?observation saref:observes ?heatPump, ?cop . ?observation saref:hasResult ?result .
        ?result rdf:type saref:PropertyValue . ?result saref:isValueOfProperty ?cop . ?result saref:hasValue ?value . ?result saref:isMeasuredIn ?unit .
    }
    OPTIONAL {
        ?heatPump rdf:type hco:HeatPump . ?heatPump saref:hasIdentifier ?id .
        ?heatPump saref:hasPropertyOfInterest ?energyUse . ?energyUse rdf:type saref:PropertyOfInterest . ?energyUse saref:hasPropertyKind hco:ElectricityUse .
        ?heatPump saref:madeExecution ?observation . ?observation rdf:type hco:LatestObservation .
        ?heatPump saref:observes ?heatPump, ?energyUse . ?heatPump saref:hasResult ?result . 
        ?result rdf:type saref:PropertyValue . ?result saref:isValueOfProperty ?energyUse . ?result saref:hasValue ?value . ?result saref:isMeasuredIn ?unit .
    }
    OPTIONAL {
        ?heatPump rdf:type hco:HeatPump . ?heatPump saref:hasPropertyOfInterest ?heatingCurve .
        ?heatingCurve rdf:type saref:PropertyOfInterest . ?heatingCurve saref:hasPropertyKind hco:HeatingCurve .
        ?heatPump saref:madeExecution ?observation . ?observation rdf:type saref:Observation .
        ?observation saref:observes ?heatPump, ?heatingCurve . ?observation saref:hasResult ?result .
        ?result rdf:type saref:PropertyValue . ?result saref:isValueOfProperty ?heatingCurve .
        ?result saref:consistsOf ?baseResult, ?slopeResult .
        ?baseResult rdf:type saref:PropertyValue . ?baseResult saref:isValueOfProperty hco:HeatingCurveBase . ?baseResult saref:hasValue ?baseValue . ?baseResult saref:isMeasuredIn ?baseUnit .
        ?slopeResult rdf:type saref:PropertyValue . ?slopeResult saref:isValueOfProperty hco:HeatingCurveSlope . ?slopeResult saref:hasValue ?slopeValue . ?slopeResult saref:isMeasuredIn ?slopeUnit .
    }
    OPTIONAL {
        ?heatPump rdf:type hco:HeatPump . ?heatPump saref:hasIdentifier ?id .
        ?heatPump saref:hasStateOfInterest ?internetConnectionState .
        ?internetConnectionState rdf:type saref:StateOfInterest . ?internetConnectionState saref:hasStateKind hco:InternetConnection .
        ?internetConnectionState saref:hasStateValue ?internetConnectionStateValue .
    }
    OPTIONAL {
        ?server rdf:type hco:Server . ?server saref:ofSupplier ?supplier .
        ?server saref:hasStateOfInterest ?stateServer . ?stateServer rdf:type saref:StateOfInterest .
        ?stateServer saref:hasStateKind hco:InternetConnection . ?stateServer saref:hasStateValue ?connectionstateServer .    
    }
    OPTIONAL {
        ?heatPump rdf:type hco:HeatPump . ?heatPump saref:hasIdentifier ?id .
        ?heatPump saref:hasErrorCode ?errorCode . ?errorCode rdf:type hco:ErrorCode .
        ?errorCode hco:hasErrorCodeValue ?errorCodeValue . ?errorCode hco:hasErrorMessage ?errorCodeMessage .
        ?errorCode hco:hasErrorSeverity ?errorCodeSeverity .
    }
}
`;

export const SPARQL_HEATPUMP_DETAILS = (heatpumpUri: string): string => `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX om: <http://www.ontology-of-units-of-measure.org/resource/om-2/>
PREFIX hco: <https://www.tno.nl/building/ontology/heatpump-common-ontology#>
PREFIX saref: <https://saref.etsi.org/core/>
PREFIX saref4bldg: <https://saref.etsi.org/saref4bldg/>
PREFIX bot: <https://w3id.org/bot#>
PREFIX saref4watr: <https://saref.etsi.org/saref4watr/>

SELECT ?heatpump ?building ?room ?currentTemperature ?temperatureSetpoint ?outside
       ?flowPressure ?observation ?startDateTime ?endDateTime ?state ?cop ?energyUse
       ?heatingCurve ?baseValue ?baseUnit ?baseResult ?slopeValue ?slopeUnit ?slopeResult
       ?internetConnectionStateValue ?connectionstateServer ?errorCodeValue
       ?errorCodeMessage ?errorCodeSeverity ?result ?value ?unit
WHERE {
  VALUES ?heatpump { <${heatpumpUri}> }
  ?heatpump rdf:type hco:HeatPump .

  OPTIONAL {
    ?heatpump rdf:type hco:HeatPump ; saref:hasIdentifier ?id .
    ?building rdf:type saref4bldg:Building ; saref4bldg:contains ?heatpump ; saref4bldg:hasSpace ?room .
    ?room rdf:type saref4bldg:BuildingSpace, saref:FeatureOfInterest ; saref:hasPropertyOfInterest ?currentTemperature .
    ?currentTemperature rdf:type saref:PropertyOfInterest ; saref:hasPropertyKind hco:CurrentTemperature .
    ?heatpump saref:madeExecution ?observation .
    ?observation rdf:type hco:LatestObservation ; saref:observes ?room, ?currentTemperature ; saref:hasResult ?result .
    ?result rdf:type saref:PropertyValue ; saref:isValueOfProperty ?currentTemperature ; saref:hasValue ?value ; saref:isMeasuredIn ?unit .
  }
  OPTIONAL {
    ?heatpump rdf:type hco:HeatPump ; saref:hasIdentifier ?id ; saref:hasPropertyOfInterest ?temperatureSetpoint .
    ?temperatureSetpoint rdf:type saref:PropertyOfInterest ; saref:hasPropertyKind hco:TemperatureSetpoint .
    ?building rdf:type saref4bldg:Building ; saref4bldg:contains ?heatpump ; saref4bldg:hasSpace ?room .
    ?room rdf:type saref4bldg:BuildingSpace .
    ?heatpump saref:madeExecution ?observation .
    ?observation rdf:type hco:LatestObservation ; saref:observes ?heatpump, ?temperatureSetpoint ; saref:hasResult ?result .
    ?result rdf:type saref:PropertyValue ; saref:isValueOfProperty ?temperatureSetpoint ; saref:consistsOf ?room ; saref:consistsOf ?temperatureResult .
    ?temperatureResult rdf:type saref:PropertyValue ; saref:hasValue ?value ; saref:isMeasuredIn ?unit .
  }
  OPTIONAL {
    ?heatpump rdf:type hco:HeatPump ; saref:hasIdentifier ?id .
    ?outside rdf:type bot:Zone, saref:FeatureOfInterest ; saref:hasPropertyOfInterest ?currentTemperature .
    ?outside bot:hasBuilding ?building .
    ?building rdf:type saref4bldg:Building ; saref4bldg:contains ?heatpump .
    ?currentTemperature rdf:type saref:PropertyOfInterest ; saref:hasPropertyKind hco:CurrentTemperature .
    ?heatpump saref:madeExecution ?observation .
    ?observation rdf:type hco:LatestObservation ; saref:observes ?outside, ?currentTemperature ; saref:hasResult ?result .
    ?result rdf:type saref:PropertyValue ; saref:isValueOfProperty ?currentTemperature ; saref:hasValue ?value ; saref:isMeasuredIn ?unit .
  }
  OPTIONAL {
    ?heatpump rdf:type hco:HeatPump ; saref:consistsOf ?waterAsset .
    ?waterAsset rdf:type hco:HeatPumpWaterAsset ; saref:hasPropertyOfInterest ?flowPressure .
    ?flowPressure rdf:type saref:PropertyOfInterest ; saref:hasPropertyKind saref4watr:FlowPressure .
    ?heatpump saref:madeExecution ?observation .
    ?observation rdf:type saref:Observation ; saref:observes ?waterAsset, ?flowPressure ; saref:hasResult ?result .
    ?result rdf:type saref:PropertyValue ; saref:isValueOfProperty ?flowPressure ; saref:hasValue ?value ; saref:isMeasuredIn ?unit .
  }
  OPTIONAL {
    ?heatpump rdf:type hco:HeatPump ; saref:hasIdentifier ?id .
    ?heatpump saref:hasState ?state .
    ?state hco:hasStartTime ?startDateTime ; hco:hasEndTime ?endDateTime .
  }
  OPTIONAL {
    ?heatpump rdf:type hco:HeatPump ; saref:hasIdentifier ?id ; saref:hasPropertyOfInterest ?cop .
    ?cop rdf:type saref:PropertyOfInterest ; saref:hasPropertyKind hco:COP .
    ?heatpump saref:madeExecution ?observation .
    ?observation rdf:type saref:Observation ; saref:observes ?heatpump, ?cop ; saref:hasResult ?result .
    ?result rdf:type saref:PropertyValue ; saref:isValueOfProperty ?cop ; saref:hasValue ?value ; saref:isMeasuredIn ?unit .
  }
  OPTIONAL {
    ?heatpump rdf:type hco:HeatPump ; saref:hasIdentifier ?id ; saref:hasPropertyOfInterest ?energyUse .
    ?energyUse rdf:type saref:PropertyOfInterest ; saref:hasPropertyKind hco:ElectricityUse .
    ?heatpump saref:madeExecution ?observation .
    ?observation rdf:type hco:LatestObservation ; saref:observes ?heatpump, ?energyUse ; saref:hasResult ?result .
    ?result rdf:type saref:PropertyValue ; saref:isValueOfProperty ?energyUse ; saref:hasValue ?value ; saref:isMeasuredIn ?unit .
  }
  OPTIONAL {
    ?heatpump rdf:type hco:HeatPump ; saref:hasPropertyOfInterest ?heatingCurve .
    ?heatingCurve rdf:type saref:PropertyOfInterest ; saref:hasPropertyKind hco:HeatingCurve .
    ?heatpump saref:madeExecution ?observation .
    ?observation rdf:type saref:Observation ; saref:observes ?heatpump, ?heatingCurve ; saref:hasResult ?result .
    ?result rdf:type saref:PropertyValue ; saref:isValueOfProperty ?heatingCurve ; saref:consistsOf ?baseResult, ?slopeResult .
    ?baseResult rdf:type saref:PropertyValue ; saref:isValueOfProperty hco:HeatingCurveBase ; saref:hasValue ?baseValue ; saref:isMeasuredIn ?baseUnit .
    ?slopeResult rdf:type saref:PropertyValue ; saref:isValueOfProperty hco:HeatingCurveSlope ; saref:hasValue ?slopeValue ; saref:isMeasuredIn ?slopeUnit .
  }
  OPTIONAL {
    ?heatpump rdf:type hco:HeatPump ; saref:hasIdentifier ?id .
    ?heatpump saref:hasStateOfInterest ?internetConnectionState .
    ?internetConnectionState rdf:type saref:StateOfInterest ; saref:hasStateKind hco:InternetConnection ; saref:hasStateValue ?internetConnectionStateValue .
  }
  OPTIONAL {
    ?server rdf:type hco:Server ; saref:ofSupplier ?supplier .
    ?server saref:hasStateOfInterest ?stateServer .
    ?stateServer rdf:type saref:StateOfInterest ; saref:hasStateKind hco:InternetConnection ; saref:hasStateValue ?connectionstateServer .
  }
  OPTIONAL {
    ?heatpump rdf:type hco:HeatPump ; saref:hasIdentifier ?id .
    ?heatpump saref:hasErrorCode ?errorCode .
    ?errorCode rdf:type hco:ErrorCode ; hco:hasErrorCodeValue ?errorCodeValue ; hco:hasErrorMessage ?errorCodeMessage ; hco:hasErrorSeverity ?errorCodeSeverity .
  }
}
`;

/**
 * Generates a unique IRI suffix for each command execution.
 * Prevents graph node collisions when multiple commands are sent.
 */
const generateIriSuffix = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/**
 * SPARQL UPDATE query to set the heating curve of a specific heat pump.
 * Uses the HCO ControlHeatingCurve command pattern.
 *
 * @param id - The heat pump string identifier (e.g. "bdgp0cbmq2t7uke")
 * @param baseValue - Base temperature in °C (e.g. 36.0)
 * @param slopeValue - Slope in °C/°C (e.g. -0.5)
 *
 * Source: Hupie API docs — HCO supported data points, UPDATE/SET: Heating Curve
 */
export const SPARQL_SET_HEATING_CURVE = (
  id: string,
  baseValue: number,
  slopeValue: number
): string => {
  const suffix = generateIriSuffix();
  const base = `https://www.tno.nl/building/data/tdi500`;
  return `
PREFIX hco: <https://www.tno.nl/building/ontology/heatpump-common-ontology#>
PREFIX om: <http://www.ontology-of-units-of-measure.org/resource/om-2/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX saref: <https://saref.etsi.org/core/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

INSERT {
  <${base}/execution-${suffix}> rdf:type saref:CommandExecution .
  <${base}/execution-${suffix}> saref:isExecutionOf ?heatingCurveCommand .
  <${base}/execution-${suffix}> saref:hasResult <${base}/result-${suffix}> .
  <${base}/result-${suffix}> rdf:type saref:PropertyValue .
  <${base}/result-${suffix}> saref:isValueOfProperty ?heatingCurve .
  <${base}/result-${suffix}> saref:consistsOf <${base}/base-${suffix}>, <${base}/slope-${suffix}> .
  <${base}/base-${suffix}> rdf:type saref:PropertyValue .
  <${base}/base-${suffix}> saref:isValueOfProperty hco:HeatingCurveBase .
  <${base}/base-${suffix}> saref:hasValue "${baseValue}"^^xsd:double .
  <${base}/base-${suffix}> saref:isMeasuredIn om:degreeCelsius .
  <${base}/slope-${suffix}> rdf:type saref:PropertyValue .
  <${base}/slope-${suffix}> saref:isValueOfProperty hco:HeatingCurveSlope .
  <${base}/slope-${suffix}> saref:hasValue "${slopeValue}"^^xsd:double .
  <${base}/slope-${suffix}> saref:isMeasuredIn hco:DegreeCelsiusPerDegreeCelsius .
}
WHERE {
  ?heatPump rdf:type hco:HeatPump .
  ?heatPump saref:hasIdentifier ?id .
  ?heatPump saref:hasPropertyOfInterest ?heatingCurve .
  ?heatPump saref:hasCommandOfInterest ?heatingCurveCommand .
  ?heatingCurve rdf:type saref:PropertyOfInterest .
  ?heatingCurve saref:hasPropertyKind hco:HeatingCurve .
  ?heatingCurveCommand rdf:type saref:CommandOfInterest .
  ?heatingCurveCommand saref:hasCommandKind hco:ControlHeatingCurve .
  ?heatingCurveCommand saref:controls ?heatPump, ?heatingCurve .
  VALUES ?id { "${id}" }
}
`;
};

/**
 * SPARQL UPDATE query to set the temperature setpoint of a specific heat pump.
 * Uses the HCO ControlTemperatureSetpoint command pattern.
 *
 * @param id - The heat pump string identifier (e.g. "bdgp0cbmq2t7uke")
 * @param value - Desired room temperature setpoint in °C (e.g. 20.5)
 *
 * Source: Hupie API docs — HCO supported data points, UPDATE/SET: Temperature Setpoint
 */
export const SPARQL_SET_TEMPERATURE_SETPOINT = (
  id: string,
  value: number
): string => {
  const suffix = generateIriSuffix();
  const base = `https://www.tno.nl/building/data/tdi500`;
  return `
PREFIX hco: <https://www.tno.nl/building/ontology/heatpump-common-ontology#>
PREFIX om: <http://www.ontology-of-units-of-measure.org/resource/om-2/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX saref: <https://saref.etsi.org/core/>
PREFIX saref4bldg: <https://saref.etsi.org/saref4bldg/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

INSERT {
  <${base}/execution-${suffix}> rdf:type saref:CommandExecution .
  <${base}/execution-${suffix}> saref:isExecutionOf ?temperatureSetpointCommand .
  <${base}/execution-${suffix}> saref:hasResult <${base}/result-${suffix}> .
  <${base}/result-${suffix}> rdf:type saref:PropertyValue .
  <${base}/result-${suffix}> saref:isValueOfProperty ?temperatureSetpoint .
  <${base}/result-${suffix}> saref:consistsOf ?room .
  <${base}/result-${suffix}> saref:consistsOf <${base}/tempresult-${suffix}> .
  <${base}/tempresult-${suffix}> rdf:type saref:PropertyValue .
  <${base}/tempresult-${suffix}> saref:hasValue "${value}"^^xsd:double .
  <${base}/tempresult-${suffix}> saref:isMeasuredIn om:degreeCelsius .
}
WHERE {
  ?heatPump rdf:type hco:HeatPump .
  ?heatPump saref:hasIdentifier ?id .
  ?heatPump saref:hasPropertyOfInterest ?temperatureSetpoint .
  ?heatPump saref:hasCommandOfInterest ?temperatureSetpointCommand .
  ?temperatureSetpoint rdf:type saref:PropertyOfInterest .
  ?temperatureSetpoint saref:hasPropertyKind hco:TemperatureSetpoint .
  ?temperatureSetpointCommand rdf:type saref:CommandOfInterest .
  ?temperatureSetpointCommand saref:hasCommandKind hco:ControlTemperatureSetpoint .
  ?temperatureSetpointCommand saref:controls ?heatPump, ?temperatureSetpoint .
  ?building rdf:type saref4bldg:Building .
  ?building saref4bldg:contains ?heatPump .
  ?building saref4bldg:hasSpace ?room .
  ?room rdf:type saref4bldg:BuildingSpace .
  VALUES ?id { "${id}" }
}
`;
};