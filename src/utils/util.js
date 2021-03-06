import { saveAs } from 'file-saver';

const MAX_DUAL_LINE_DISTANCE = 60;
const LINE_VALUE_INDICATOR_WIDTH = MAX_DUAL_LINE_DISTANCE; // 120;
const LINE_VALUE_INDICATOR_HEIGHT = 30;
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
            const newRelationships = (concept && concept.relationships ? concept.relationships : []).map((relationship) => {
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
            // parse x/y position and remove those attributes if this is a property/sub-concept
            const conceptWithPositionUpdated = {
                ...concept,
                x: concept.x && !isNaN(parseInt(concept.x, 10)) ? parseInt(concept.x, 10) : 13,
                y: concept.y && !isNaN(parseInt(concept.y, 10)) ? parseInt(concept.y, 10) : 13,
            };
            if (concept.parentComponentId) {
                delete conceptWithPositionUpdated.x;
                delete conceptWithPositionUpdated.y;
            };
            return {
                ...conceptWithPositionUpdated,
                relationships: newRelationships,
            };
        });
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
        const info = {
            ...state.info,
            date: new Date().toString()
        };
        if (state.concepts && state.concepts.collection) {
            concepts = state.concepts.collection.filter((concept) => (
                !concept.parentComponentId
            )).map((concept) => {
                const relationships = (concept && concept.relationships ? concept.relationships : []).map((relationship) => (
                    {
                        id: relationship.id,
                        notes: relationship.notes,
                        name: relationship.name
                    } 
                ));
                const properties = (concept && concept.properties ? concept.properties : []).map((propertyId) => {
                    const property = util.findConcept(state.concepts.collection, propertyId);
                    const propertyRelationships = (property && property.relationships ? property.relationships : []).map((relationship) => (
                        {
                            id: relationship.id,
                            notes: relationship.notes,
                            name: relationship.name
                        } 
                    ));
                    return {
                        id: property.id,
                        name: property.name,
                        notes: property.notes,
                        group: concept.group,
                        parentComponentId: concept.id,
                        relationships: propertyRelationships,
                    };     
                });
                return {
                    id: concept.id,
                    name: concept.name,
                    notes: concept.notes,
                    group: concept.group,
                    parent: concept.parentComponent,
                    x: concept.x,
                    y: concept.y,
                    relationships,
                    properties
                };
            })
        }

        const js = {concepts, groupNames, info};
        return {
            js,
            json: JSON.stringify(js)
        };
    },

    writeLocalFile({content, name, type}) {
        try {
            name = name || `[name].${type === 'json' ? '.emp' : '.png'}`;
            // console.log('writeLocalFile, content:', content);
            const link = document.createElement('a');
            let url = content;
            if (type === 'json') {
                var bb = new Blob([content], { type: 'application/json'}); // 'text/plain' });
                url = window.URL.createObjectURL(bb);
            } else if (type === 'canvas') {
                url = content.toDataURL();
            }
            if (typeof link.download === 'string') {
                // link.href = url;
                // link.download = name
                // document.body.appendChild(link);
                // link.click();
                saveAs(url, name);
            } else {
                if (type === 'json') {
                    window.open(url);
                } else {
                    alert('Image download not supported in your current browser. Please use a modern browser.');
                }
            }
            link.remove();
            type === 'json' && url && window.URL.revokeObjectURL(url);
        } catch (e) {
            console.log('ERROR - writeLocalFile\ne:', e, '\ntype:', type, ', name:', name, '\ncontent:', content);
        }
    },
    
    loadFile(e) {
        const file = e.target.files[0];
        if (file) {
            const fileReader = new FileReader();
            fileReader.onloadend = (e) => {
                const result = e.target.result;
                if (window.MentalModelerConceptMap) {
                    window.MentalModelerConceptMap.load(result);
                } else {
                    alert.error('ERROR - window.MentalModelerConceptMap is undefined');
                }
            };
            fileReader.readAsText(file);
        }
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

    getOffsetX({inDualRelationship, isFirstInDualRelationship}) {
        if (inDualRelationship) {
            return isFirstInDualRelationship
                ? LINE_VALUE_INDICATOR_WIDTH / 2
                : - LINE_VALUE_INDICATOR_WIDTH / 2;
        }
        return 0;
    },

    getOffsetY({inDualRelationship, isFirstInDualRelationship, height = LINE_VALUE_INDICATOR_HEIGHT}) {
        if (inDualRelationship) {
            const heightToUse = Math.max(LINE_VALUE_INDICATOR_HEIGHT, Math.min(height, MAX_DUAL_LINE_DISTANCE))
            return isFirstInDualRelationship
                ? (heightToUse - 2) / 2
                : - (heightToUse - 2) / 2;
        }
        return 0;
    },

    determineEdgePoint({eeX, eeY, erX, erY, eeWidth, eeHeight, inDualRelationship = false, isFirstInDualRelationship = false, dualRelationshipHeight = LINE_VALUE_INDICATOR_HEIGHT}) {
        let pct;
        const dist = util.getDistanceBetweenPoints(eeX, eeY, erX, erY);
        const eeRadians = Math.atan2(erX - eeX, erY - eeY);
        const w = eeWidth / 2 + (erX > eeX 
            ? - util.getOffsetX({inDualRelationship, isFirstInDualRelationship})
            : util.getOffsetX({inDualRelationship, isFirstInDualRelationship}));
        const h = eeHeight / 2 + (erY > eeY
            ? - util.getOffsetY({inDualRelationship, isFirstInDualRelationship, height: dualRelationshipHeight})
            : util.getOffsetY({inDualRelationship, isFirstInDualRelationship, height: dualRelationshipHeight}));
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

    getParentAndProperties({collection, conceptId, concept, idsOnly = true}) {
        // TODO Optimize to use concept ref from args instead of concept id
        const conceptParent = util.getParentConcept({collection, conceptId}) || {};
        const conceptPropertiesIds = conceptParent && conceptParent.properties ? conceptParent.properties : [];
        // safety check with Array.filter might be overkill
        return idsOnly
            ? [conceptParent.id, ...conceptPropertiesIds] // .filter((id) => !!id)
            : [conceptParent, ...conceptPropertiesIds.map((id) => util.findConcept(collection, id))]; // .filter((_concept) => !!_concept && !!_concept.id);
    },

    isIntraConceptRelationship({collection, tempRelationship, tempTarget}) {
        return tempTarget && tempRelationship && tempRelationship.id
            ? util.getParentAndProperties({collection, conceptId: tempRelationship.id})
                  .indexOf(tempTarget) > -1
            : false;
    },

    getAllRelationships({collection, conceptId, concept, idsOnly = false}) {
        // TODO Optimize to use concept ref from args instead of concept id
        return util.getParentAndProperties({collection, conceptId, idsOnly: false})
            .flatMap((_concept) => {
                const relationships = (_concept && _concept.relationships) || [];
                return idsOnly
                    ? relationships.map((relationship) => relationship.id)
                    : relationships;
            });
    },

    alreadyHasRelationship({collection, influencerId, influenceeId, influencer, influencee}) {
        // TODO Optimize to use concept ref from args instead of concept id
        const allInfluencerStackRelationships = util.getAllRelationships({
            collection,
            conceptId: influencerId,
            concept: influencer
        });
        const allInfluenceeStackIds = util.getParentAndProperties({
            collection,
            conceptId: influenceeId,
            concept: influencee
        });
        const alreadyHasRelationship = allInfluencerStackRelationships.some((relationship) => {
            const alreadyHas = allInfluenceeStackIds.indexOf(relationship.id) > -1;
            alreadyHas && console.log('--- has relationship with ', relationship.id);
            return alreadyHas;
        });
        console.log('alreadyHasRelationship >', alreadyHasRelationship, '\n\tinfluencerId:', influencerId, ', influenceeId:', influenceeId);
        return alreadyHasRelationship;
    },

    makesDualRelationship({collection, influencerId, influenceeId, influencer, influencee}) {
        // TODO Optimize to use concept ref from args instead of concept id
        const allInfluenceeStackRelationships = util.getAllRelationships({
            collection,
            conceptId: influenceeId
        });
        const allInfluencerStackIds = util.getParentAndProperties({
            collection,
            conceptId: influencerId,
            concept: influencer
        });
        const relationship = allInfluenceeStackRelationships.find((_relationship) => (
            allInfluencerStackIds.indexOf(_relationship.id) > -1
        ));
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
};

export {
    util,
    ELEMENT_TYPE,
    CONFIDENCE__VALUES,
    SETTINGS
};

export default util;