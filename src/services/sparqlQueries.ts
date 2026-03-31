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