import React, { Component } from 'react';
import { connect } from 'react-redux';
import ConceptStack from '../Concept/ConceptStack';
import Concept from '../Concept/Concept';
import util from '../../utils/util';


class Concepts extends Component {
    render() {
        const {concepts} = this.props;
        const {
            collection,
            selectedConcept,
            selectedRelationship,
            selectedType,
            selectedData,
            associatedData,
            tempRelationship,
            tempTarget,
            viewFilter
        } = concepts;
        const hasTempRelationship = !!tempRelationship;
        let sConcept = {};
        let selectedRelationships = [];
        if (selectedConcept !== null || selectedRelationship !== null) {
            sConcept = util.findConcept(collection, selectedConcept);
            selectedRelationships = sConcept && sConcept.relationships
                ? sConcept.relationships
                : [];
        } 
        // console.log('\n\nConcepts > render'
        //     , '\n\tselectedConcept:', selectedConcept
        //     , '\n\tsConcept:', sConcept
        //     , '\n\tselectedRelationships:', selectedRelationships
        //     , '\n\tselectedRelationships:', selectedRelationships
        //     , '\n\tviewFilter:', viewFilter
        //     // , '\n\ttempRelationship:', tempRelationship
        //     // , '\n\ttempTarget:', tempTarget
        //     , '\n\n'
        // );
        // console.log('Concepts > render\n\tconcepts:', concepts);
        
        // console.log('Concepts, collection:', collection);
        return (
            <div className="map__concepts">
            {collection
                .filter((concept) => !concept.parentComponentId)
                .map((concept) => {
                    let isExcludedByFilter = util.isConceptExcludedByFilter({
                        viewFilter,
                        selectedConcept,
                        selectedRelationships,
                        concept,
                        collection
                    });
                    const { id, x, y, properties = []} = concept; // eslint-disable-line
                    return (
                        <div
                            className="Concept-wrapper"
                            style={{left: `${x}px`,top: `${y}px`,}}
                            key={`concept-${id}`}
                            id={`concept-${id}-wrapper`}
                        >
                            <Concept
                                {...concept}
                                hasTempRelationship={hasTempRelationship}
                                isTempRelationship={hasTempRelationship && concept.id === tempRelationship.id}
                                tempTarget={tempTarget}
                                selected={!selectedRelationship && id === selectedConcept}
                                selectedRelationship={!!selectedRelationship && (id === selectedConcept || id === selectedRelationship)}
                                isExcludedByFilter={isExcludedByFilter}
                                // selectedConcept={selectedConcept}
                                // selectedRelationship={selectedRelationship}
                                // selectedType={selectedType}
                                // selectedData={selectedData}
                                // associatedData={associatedData}
                            />
                            {properties.map((pId) => {
                                const property = util.findConcept(collection, pId);
                                // console.log('pId:', pId, '\nproperty:', property, '\n\n');
                                isExcludedByFilter = util.isConceptExcludedByFilter({
                                    viewFilter,
                                    selectedConcept,
                                    selectedRelationships,
                                    property,
                                    collection
                                });
                                return (
                                    <Concept
                                        key={`property-${property.id}`}
                                        {...property}
                                        group={concept.group}
                                        parentComponentId={concept.id}
                                        parentComponent={{...concept}}
                                        hasTempRelationship={hasTempRelationship}
                                        isTempRelationship={hasTempRelationship && property.id === tempRelationship.id}
                                        tempTarget={tempTarget}
                                        selected={!selectedRelationship && property.id === selectedConcept}
                                        selectedRelationship={!!selectedRelationship && (property.id === selectedConcept || property.id === selectedRelationship)}
                                        isExcludedByFilter={isExcludedByFilter}
                                        // selectedConcept={selectedConcept}
                                        // selectedRelationship={selectedRelationship}
                                        // selectedType={selectedType}
                                        // selectedData={selectedData}
                                        // associatedData={associatedData}
                                    />
                                );
                            })}
                        </div>
                    );
                    {/* return (
                        <Concept
                            key={`concept_${concept.id}`}
                            {...concept}
                            hasTempRelationship={hasTempRelationship}
                            isTempRelationship={hasTempRelationship && concept.id === tempRelationship.id}
                            tempTarget={tempTarget}
                            selected={concept.id === selectedConcept && selectedRelationship === null}
                            isExcludedByFilter={isExcludedByFilter}
                        />
                        <ConceptStack
                            key={`concept-stack_${concept.id}`}
                            {...concept}
                            hasTempRelationship={hasTempRelationship}
                            isTempRelationship={hasTempRelationship && concept.id === tempRelationship.id}
                            tempTarget={tempTarget}
                            selected={concept.id === selectedConcept && selectedRelationship === null}
                            isExcludedByFilter={isExcludedByFilter}
                            concepts={concepts}
                        />
                    );
                    */}
                })
            }
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        concepts: state.concepts,
    };
}

export default connect(mapStateToProps)(Concepts);