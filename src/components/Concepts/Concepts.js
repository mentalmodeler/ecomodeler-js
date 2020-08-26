import React, { Component } from 'react';
import { connect } from 'react-redux';
import ConceptStack from '../Concept/ConceptStack';
import util from '../../utils/util';


class Concepts extends Component {
    render() {
        const {concepts} = this.props;
        const {collection, selectedConcept, selectedRelationship, tempRelationship, tempTarget, viewFilter} = concepts;
        const hasTempRelationship = !!tempRelationship;
        let sConcept = {};
        let selectedRelationships = [];
        if (selectedConcept !== null || selectedRelationship!== null) {
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
        return (
            <div className="map__concepts">
            {collection
                .filter((concept) => (!concept.parentComponent || concept.parentComponent === ''))
                .map((concept) => {
                    const isExcludedByFilter = util.isConceptExcludedByFilter({
                        viewFilter,
                        selectedConcept,
                        selectedRelationships,
                        concept,
                        collection
                    });
                    const concepts = [concept].concat(util.findSubconcepts(collection, concept.id));
                    // console.log(`id:${concept.id}, isExcludedByFilter: ${isExcludedByFilter}\n`);
                    return (
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