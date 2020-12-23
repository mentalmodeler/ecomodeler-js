const LINE_VALUE_INDICATOR_WIDTH = 120;
const ELEMENT_TYPE = {
    CONCEPT: 'concept',
    RELATIONSHIP: 'relationship'
};
const SETTINGS = {
    START_X: 10,
    START_Y: 10,
    CONCEPT_START_INCR: 10
};

const CONFIDENCE__VALUES = [3, 2, 1, 0, -1, -2, -3];

const util = {
    initData(data) {
        const {
            concepts,
            groupNames,
            info,
            scenarios
        } = data;
        // initialize and format concept and relationship data
        
        // parse out property concepts to be the same level as concepts.
        // replace concept properties object array with an array of the properties ids
        const properties = [];
        let collection = concepts.map((concept) => {
            const newProperties = (concept.properties || []).map((property) => {
                properties.push({
                    ...property,
                    parentComponentId: concept.id
                });
                return property.id;
            })
            return {...concept, properties: newProperties};
        });
        collection = [...collection, ...properties];

        // assign relationships dual relationship status, if needed
        collection = collection.map((concept) => {
            const newRelationships = (concept && concept.relationships || []).map((relationship) => {
                if (!relationship.inDualRelationship) {
                    const {makesDualRelationship, otherRelationship} = util.makesDualRelationship({
                        collection,
                        influencerId: concept.id,
                        influenceeId: relationship.id
                    });
                    if (makesDualRelationship && otherRelationship) {
                        relationship.inDualRelationship = true;
                        relationship.isFirstInDualRelationship = false;
                        otherRelationship.inDualRelationship = true;
                        otherRelationship.isFirstInDualRelationship = true;
                    }
                }
                let influence = parseFloat(relationship.influence);
                if (isNaN(influence)) {
                    influence = 0;
                }
                return {...relationship, influence}
            });
            return {...concept, relationships: newRelationships, x: parseInt(concept.x, 10), y: parseInt(concept.y, 10)};
        })
        // console.log('initData, collection:', collection);
        return {
            concepts: {
                collection,
                selectedConcept: null,
                selectedRelationship: null,
                tempRelationship: null,
                tempTarget: null,
                viewFilter: -1
            },
            groupNames,
            info,
            scenarios
        };
    },

    exportData(state = {}) {
        let concepts = [];
        let groupNames = {0: '', 1: '', 2: '', 3: '', 4: '', 5: ''};
        if (state.groupNames) {
            groupNames = {...groupNames, ...state.groupNames};
        }
        if (state.concepts && state.concepts.collection) {
            concepts = state.concepts.collection.map((concept) => {
                // TODO - store sub-components in the properties array
                // const properties;
                const relationships = concept && concept.relationships ? concept.relationships : [];
                const newRelationships = relationships.map((relationship) => (
                    {
                        id: relationship.id,
                        notes: relationship.notes,
                        confidence: relationship.confidence,
                        influence: relationship.influence,
                        name: relationship.name
                    } 
                ));
                const newConcept = {
                    id: concept.id,
                    name: concept.name,
                    notes: concept.notes,
                    units: concept.units,
                    group: concept.group,
                    parent: concept.parentComponent,
                    x: concept.x,
                    y: concept.y,
                    preferredState: concept.preferredState,
                }
                return {...newConcept, relationships: newRelationships};
            })
        }

        const js = {concepts, groupNames};
        return {
            js,
            json: JSON.stringify(js)
        };
    },

    getConceptsPosition(collection) {
        const positions = {};
        collection.forEach((concept) => {
            const conceptForPosition = util.getParentConcept({collection, concept});
            positions[concept.id] = {
                x: parseInt(conceptForPosition.x, 10),
                y: parseInt(conceptForPosition.y, 10),
                width: conceptForPosition.width,
                height: conceptForPosition.height,
                totalHeight: conceptForPosition.totalHeight
            };

        });
        return positions;
    },

    getParentConcept({collection, concept, conceptId}) {
        // console.log('getParentConcept\n\tconceptId:', conceptId, '\n\tconcept:', concept, ',\n\tcollection:', collection, '\n\n');
        if (!concept) {
            concept = util.findConcept(collection, conceptId);
        }
        return concept.parentComponentId
            ? util.findConcept(collection, concept.parentComponentId)
            : concept;
    },

    getPosition(id, positions) {
        return positions[id] || {x: 0, y: 0, width: 0, height: 0, totalHeight: 0};
    },


    getDistanceBetweenPoints(x1, y1, x2, y2) {
        const a = x1 - x2;
        const b = y1 - y2;
        return Math.sqrt(a * a + b * b);
    },

    getOffset({inDualRelationship, isFirstInDualRelationship}) {
        if (inDualRelationship) {
            return isFirstInDualRelationship
                ? LINE_VALUE_INDICATOR_WIDTH / 2
                : - LINE_VALUE_INDICATOR_WIDTH / 2;
        }
        return 0;
    },

    determineEdgePoint({eeX, eeY, erX, erY, eeWidth, eeHeight, inDualRelationship = false, isFirstInDualRelationship = false}) {
        let pct;
        const dist = util.getDistanceBetweenPoints(eeX, eeY, erX, erY);
        const eeRadians = Math.atan2(erX - eeX, erY - eeY);
        const w = eeWidth / 2 + (erX > eeX 
            ? - util.getOffset({inDualRelationship, isFirstInDualRelationship})
            : util.getOffset({inDualRelationship, isFirstInDualRelationship}));
        const h = eeHeight / 2;
        const cos = Math.cos(eeRadians);
        let hypo = Math.abs(h / cos);
        const opposite = Math.sqrt(Math.pow(hypo, 2) - Math.pow(h, 2));
        const adj = 0;
        if (opposite < w) {
            pct = (dist - hypo + adj) / dist;
            pct = 1 - pct;
        } else {
            const sin = Math.sin(eeRadians);
            hypo = Math.abs(w / sin);
            pct = (dist - hypo + adj) / dist;
            pct = 1 - pct;
        }
        const x = eeX + (erX - eeX) * pct;
        const y = eeY + (erY - eeY) * pct;
        
        return {x, y};
    },

    findConcept(collection, id) {
        return collection.find((concept) => (concept.id === id));
    },

    getPropValue(object = {}, path = [], defaultValue = '') {
        let o = object;
        let found = false;
        while (path.length > 0) {
            const prop = path.shift();
            if (o && o.hasOwnProperty(prop)) {
                o = o[prop];
                found = true;
            } else {
                return defaultValue;
            }
        }
        return found
            ? o
            : defaultValue;
    },

    createId() {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return [...Array(19)].map((value, index) => {
            if (index === 0) {
                return chars[Math.floor(Math.random() * (chars.length - 10))]
            }
            return (index + 1) % 5 === 0
                ? '-'
                : chars[Math.floor(Math.random() * chars.length)]
        }).join('');
    },

    normalize(value, min = -1, max = 1) {
        return Math.max(Math.min(value, max), min);
    },

    getParentAndPropertyIds({collection, conceptId, concept}) {
        const parentConcept = util.getParentConcept({collection, conceptId, concept});
        return [parentConcept.id, ...(parentConcept && parentConcept.properties || [])]
    },

    getAllRelationships({collection, conceptId, concept}) {
        // TODO Optimize to use concept ref from args instead of concept id
        const conceptParent = util.getParentConcept({collection, conceptId});
        const conceptParentRelationships = conceptParent && conceptParent.relationships || [];
        const conceptParentPropertiesRelationships = (conceptParent && conceptParent.properties || []).flatMap((propertyId) => {
            const property = util.findConcept(collection, propertyId);
            return property.relationships || []
        });
        return [...conceptParentRelationships, ...conceptParentPropertiesRelationships];
    },

    alreadyHasRelationship({collection, influencerId, influenceeId, influencer, influencee}) {
        // TODO Optimize to use concept ref from args instead of concept id
        const allInfluencerRelationships = util.getAllRelationships({
            collection,
            conceptId: influencerId,
            concept: influencer
        });
        const allInfluenceeIds = util.getParentAndPropertyIds({
            collection,
            conceptId: influenceeId,
            concept: influencee
        });
        // console.log('alreadyHasRelationship:', alreadyHasRelationship, '\n-----\ninfluencerId:', influencerId, '\n\tallInfluencerRelationships:', allInfluencerRelationships, '\ninfluenceeId:', influenceeId, '\n\tallInfluenceeIds:', allInfluenceeIds, '\n\n');
        return allInfluencerRelationships.some((relationship) => (
            allInfluenceeIds.indexOf(relationship.id > -1)
        ));
    },

    makesDualRelationship({collection, influencerId, influenceeId, influencer, influencee}) {
        // TODO Optimize to use concept ref from args instead of concept id
        const allInfluenceeRelationships = util.getAllRelationships({
            collection,
            conceptId: influenceeId
        });
        const allInfluencerIds = util.getParentAndPropertyIds({
            collection,
            conceptId: influencerId,
            concept: influencer
        });
        const relationship = allInfluenceeRelationships['find']((_relationship) => (
            allInfluencerIds.indexOf(_relationship.id) > -1
        ));
        // console.log('relationship:', relationship, '\nallInfluencerIds:', allInfluencerIds, '\nallInfluenceeRelationships:', allInfluenceeRelationships, '\n\n');
        return {
            makesDualRelationship: !!relationship,
            otherRelationship: relationship
        };
    },

    isConceptExcludedByFilter({viewFilter, selectedConcept, selectedRelationships, concept, collection}) {
        switch (viewFilter) {
            case 0: // lines from
                return !(
                    concept.id === selectedConcept
                        || selectedRelationships.some((relationship) => (concept.id === relationship.id))
                );
            case 1: // lines to
                    return concept.id === selectedConcept
                        ? false
                        : !concept.relationships.some((relationship) => (relationship.id === selectedConcept));
            default:
                return false
        }
    },

    isRelationshipExcludedByFilter({viewFilter, selectedConcept, concept, influencerId, influenceeId, collection}) {
        switch (viewFilter) {
            case 0: // lines from
                return concept.id !== selectedConcept;
            case 1: // lines to
                return influenceeId !== selectedConcept;
            default:
                return false;
        }
    },

    isConceptAtPosition(collection = [], x = SETTINGS.START_X, y = SETTINGS.START_X) {
        return collection.some((concept) => (concept.x === x && concept.y === y))
    },

    getStartPosition(collection) {
        let x = SETTINGS.START_X;
        let y = SETTINGS.START_Y;
        let startX = -1;
        let startY = -1;
        while (startX < 0 && startY < 0) {
            if (!util.isConceptAtPosition(collection, x, y)) {
                startX = x;
                startY = y;
            } else {
                x += SETTINGS.CONCEPT_START_INCR;
                y += SETTINGS.CONCEPT_START_INCR;
            }
        }
        return {x: startX, y: startY};
    },

    getSelectedAndAssociatedData({collection, selectedConcept, selectedRelationship}) {
        let selectedType;
        let selectedData;
        const associatedData = {
            influencer: {},
            influencee: {}
        };        
        if (selectedConcept !== null || selectedRelationship  !== null) {
            selectedType = selectedRelationship !== null
                ? ELEMENT_TYPE.RELATIONSHIP
                : ELEMENT_TYPE.CONCEPT;
            const selectedConceptData = collection.find((concept) => (
                concept.id === selectedConcept
            ));
            let selectedRelationshipData;
            if (selectedType === ELEMENT_TYPE.RELATIONSHIP && selectedConceptData && selectedConceptData.relationships) {
                selectedRelationshipData = selectedConceptData.relationships.find((relationship) => (
                    relationship.id === selectedRelationship
                ));
            }
            selectedData = selectedConceptData;
            if (selectedType === ELEMENT_TYPE.RELATIONSHIP) {
                selectedData = selectedRelationshipData;
                associatedData.influencer = selectedConceptData;
                associatedData.influencee = util.findConcept(collection, selectedRelationshipData.id);
            }
        }

        return {
            selectedType,
            selectedData,
            associatedData
        };
    },
    isValidRelationship({id, parentComponent, subconcepts, targetId}) {

    }
};

export {
    util,
    ELEMENT_TYPE,
    CONFIDENCE__VALUES,
    SETTINGS
};

export default util;