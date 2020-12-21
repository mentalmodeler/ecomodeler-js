import React, { Component } from 'react';
import { connect } from 'react-redux';
import ConceptStack from '../Concept/ConceptStack';
import Concept from '../Concept/Concept';
import util from '../../utils/util';


class Concepts extends Component {
    render() {
        const {concepts} = this.props;
        const {collection, selectedConcept, selectedRelationship, tempRelationship, tempTarget, viewFilter} = concepts;
        const hasTempRelationship = !!tempRelationship;
        let sConcept = {};
        let selectedRelationships = [];
        if (selectedConcept !== null || selectedRelationship !== null) {
            sConcept = util.findConcept(collection, selectedConcept);
            selectedRelationships = sConcept && sConcept.relationships
                ? sConcept.relationships
                : [];
        } 
        const getConcept = (id) => collection.find(c => c.id === id);
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
                    // const concepts = [concept].concat(util.findSubconcepts(collection, concept.id));
                    // console.log(`id:${concept.id}, isExcludedByFilter: ${isExcludedByFilter}\n`);
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
                                selected={id === selectedConcept && selectedRelationship === null}
                                isExcludedByFilter={isExcludedByFilter}
                            />
                            {properties.map((pId) => {
                                const property = getConcept(pId);
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
                                        parentComponentId={concept.id}
                                        parentComponent={{...concept}}
                                        hasTempRelationship={hasTempRelationship}
                                        isTempRelationship={hasTempRelationship && property.id === tempRelationship.id}
                                        tempTarget={tempTarget}
                                        selected={property.id === selectedConcept && selectedRelationship === null}
                                        isExcludedByFilter={isExcludedByFilter}
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
        concepts: state.concepts
    };
}

export default connect(mapStateToProps)(Concepts);