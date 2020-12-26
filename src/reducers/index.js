
import {combineReducers} from 'redux';
import {util, SETTINGS} from '../utils/util';

const createRelationship = function(props = {}) {
    return {...{id: '-1', name: '', notes:  '', confidence: 0, influence: 0}, ...props};
}

const createConcept = function(props = {}) {
    console.log('Reducer > createConcept\n\tprops:', props);
    return {
        id: util.createId(),
        name: '',
        notes:  '',
        units: '',
        preferredState: 0,
        group: 0,
        x: SETTINGS.START_X,
        y: SETTINGS.START_X,
        relationships: [],
        properties: [],
        ...props
    };
}

const createProperty = function(props = {}) {
    return {
        id: util.createId(),
        parentComponentId: '',
        name: '',
        notes:  '',
        relationships: [],
        ...props
    };
}

const getConcept = function (collection, id) {
    const concept = collection.find((concept) => concept.id === id) || {};
    return {...concept};
};

const updateCollectionConcept = function (collection, id, updatedProps = {}) {
    // console.log('updateCollectionConcept\n\tid:', id, '\n\tupdatedProps:', updatedProps );
    return collection.map((concept) => (concept.id === id ? {...concept, ...updatedProps} : concept));
};

const removeConceptFromCollection = function (collection, removeId) {
    // remove any relationships pointing to the removed concept
    return collection.map((concept) => (
        {...concept, relationships: removeRelationships(removeId, concept.relationships)}
    )).filter((concept) => (concept.id !== removeId));
};

const removeRelationships = function (influenceeId, relationships = []) {
    return relationships.filter((relationship) => (relationship.id !== influenceeId));
};

const removeRelationshipFromConcept = function(collection, influencerId, influenceeId) {
    const newCollection = collection.map((concept) => {
        if (concept.id === influencerId) {
            // keep all relationships but this one
            const relationships = concept.relationships || [];
            const newRelationships = relationships.filter((relationship) => (
                relationship.id !== influenceeId
            ));
            // unmark other relationship in dual relationship, if exists
            const {makesDualRelationship, otherRelationship} = util.makesDualRelationship({collection, influencerId, influenceeId});
            if (makesDualRelationship && otherRelationship) {
                otherRelationship.inDualRelationship = false;
                otherRelationship.isFirstInDualRelationship = false;
            }
            return {...concept, relationships: newRelationships};
        }
        return concept;
    });

    return newCollection;
}

const addRelationshipToConcept = function (collection, influencerId, influenceeId) {
    let inDualRelationship = false;
    console.log('addRelationshipToConcept\n\tinfluencerId:', influencerId, ', influenceeId:', influenceeId);
    let newCollection = collection.map((concept) => {
        if (concept.id === influencerId) {
            const relationships =  concept.relationships ? [...concept.relationships] : [];
            // check to see if would make dual relationship
            const {makesDualRelationship, otherRelationship} = util.makesDualRelationship({collection, influencerId, influenceeId});
            console.log('\tmakesDualRelationship:', makesDualRelationship, ', otherRelationship:', otherRelationship);
            inDualRelationship = makesDualRelationship;
            relationships.push(createRelationship({
                id: influenceeId,
                inDualRelationship,
                isFirstInDualRelationship: false
            }));
            //  directly manipulating object.
            if (otherRelationship) {
                otherRelationship.inDualRelationship = true;
                otherRelationship.isFirstInDualRelationship = true;
            }
            return {...concept, relationships: relationships};
        }
        return concept;
    });
    return newCollection;
};

const updateCollectionRelationship = function (collection, influencerId, influenceeId, updatedProps = {}) {
    // console.log('updateCollectionRelationship\n\tinfluencerId:', influencerId, ', influenceeId:', influenceeId, ', updatedProps:', updatedProps);
    return collection.map((concept) => {
        if (concept.id === influencerId && concept.relationships && concept.relationships.length > 0) {
            const newRelationships = concept.relationships.map((relationship) => (
                relationship.id === influenceeId ? {...relationship, ...updatedProps} : relationship
            ));
            return {...concept, relationships: newRelationships};
        }
        return concept;
    });
};

const concepts = (
    state = {
        collection:[],
        selectedConcept: null,
        selectedRelationship: null,
        tempRelationship: null,
        tempTarget: null,
        viewFilter: -1
    },
    action) => {
    // console.log('concepts REDUCER, action:', action);
    if (typeof state.viewFilter === 'undefined' || state.viewFilter === null) {
        state.viewFilter = -1
    }
    const {collection} = state;
    // console.log(action.type);
    switch (action.type) {
        case 'CONCEPT_MOVE':
            return {
                ...state,
                collection: updateCollectionConcept(collection, action.id, {
                    x: action.x,
                    y: action.y
                })
            };
        case 'CONCEPT_FOCUS':
            console.log('CONCEPT_FOCUS, selectedConcept:', selectedConcept)
            let selectedConcept = action.id;
            let selectedRelationship = null;
            let selectedAndAssociatedData = util.getSelectedAndAssociatedData({collection, selectedConcept, selectedRelationship});
            // console.log('CONCEPT_FOCUS\n\tselectedConcept:', selectedConcept, ', selectedRelationship:', selectedRelationship, '\n\tselectedAndAssociatedData:', selectedAndAssociatedData);
            return {...state, selectedConcept, selectedRelationship, ...selectedAndAssociatedData};
        case 'RELATIONSHIP_FOCUS':
            selectedConcept = action.influencerId;
            selectedRelationship = action.influenceeId;
            selectedAndAssociatedData = util.getSelectedAndAssociatedData({collection, selectedConcept, selectedRelationship});
            // console.log('RELATIONSHIP_FOCUS\n\tselectedConcept:', selectedConcept, ', selectedRelationship:', selectedRelationship, '\n\tselectedAndAssociatedData:', selectedAndAssociatedData);
            return {...state, selectedConcept, selectedRelationship, ...selectedAndAssociatedData};
        case 'RELATIONSHIP_CHANGE_CONFIDENCE':
            return {
                ...state,
                collection: updateCollectionRelationship(collection, action.influencerId, action.influenceeId, {
                    confidence: action.value
                })
            };
        case 'RELATIONSHIP_CHANGE_INFLUENCE':
            return {
                ...state,
                collection: updateCollectionRelationship(collection, action.influencerId, action.influenceeId, {
                    influence: action.value
                })
            };
        case 'RELATIONSHIP_CHANGE_LABEL':
            console.log('RELATIONSHIP_CHANGE_LABEL, action.value:', action.value);
            return {
                ...state,
                collection: updateCollectionRelationship(collection, action.influencerId, action.influenceeId, {
                    label: action.value
                })
            };
        case 'RELATIONSHIP_DELETE':
            return {
                ...state,
                selectedConcept: null,
                selectedRelationship: null,
                collection: removeRelationshipFromConcept(collection, action.influencerId, action.influenceeId)
            };
        case 'RELATIONSHIP_DRAW_TEMP':
            let tempRelationship = null;
            if (action.drawing) {
                tempRelationship = {
                    id: action.id,
                    startX: action.startX,
                    startY: action.startY,
                    endX: action.endX,
                    endY: action.endY,
                    width: action.width,
                    height: action.height,
                    centerClickDiffX: action.centerClickDiffX,
                    centerClickDiffY: action.centerClickDiffY
                };
            }
            return {
                ...state,
                tempRelationship
            };
        case 'RELATIONSHIP_SET_TEMP_TARGET':
            // console.log('RELATIONSHIP_SET_TEMP_TARGET, tempTarget:', action.id);
            return {
                ...state,
                tempTarget: action.id
            };
        case 'RELATIONSHIP_ADD':
            const alreadyHasRelationship = util.alreadyHasRelationship({
                collection,
                influencerId: action.influencerId,
                influenceeId: action.influenceeId
            });
            // console.log('RELATIONSHIP_ADD, alreadyHasRelationship:', alreadyHasRelationship, '\n\taction.influencerId:', action.influencerId, ', action.influenceeId:', action.influenceeId);
            if (!alreadyHasRelationship) {
                return {
                    ...state,
                    collection: addRelationshipToConcept(collection, action.influencerId, action.influenceeId),
                    selectedConcept: action.influencerId,
                    selectedRelationship: action.influenceeId,
                    tempTarget: null
                };
            }
            return state;
        case 'CONCEPT_ADD':
            // console.log('CONCEPT_ADD > action:', action);
            let newCollection = [...collection];
            const {x, y} = util.getStartPosition(newCollection)
            newCollection.push(createConcept({x, y}));
            return {
                ...state,
                collection: newCollection
            };
        case 'CONCEPT_DELETE':
            return {
                ...state,
                collection: removeConceptFromCollection(collection, action.id)
            };
        case 'CONCEPT_CHANGE':
            return {
                ...state,
                collection: updateCollectionConcept(collection, action.id, {
                    name: action.name,
                    width: action.width,
                    height: action.height,
                    totalHeight: action.totalHeight,
                })
            };
        case 'CONCEPT_CHANGE_NOTES':
            return {
                ...state,
                collection: updateCollectionConcept(collection, action.id, {
                    notes: action.notes
                })
            };
        case 'CONCEPT_CHANGE_UNITS':
            return {
                ...state,
                collection: updateCollectionConcept(collection, action.id, {
                    units: action.units
                })
            };
        case 'CONCEPT_CHANGE_GROUP':
            return {
                ...state,
                collection: updateCollectionConcept(collection, action.id, {
                    group: action.groupIndex
                })
            };
        case 'PROPERTY_ADD':
            // console.log('PROPERTY_ADD > action:', action);
            let concept = util.findConcept(collection, action.parentComponentId);
            let property = createProperty({parentComponentId: action.parentComponentId});
            newCollection = updateCollectionConcept(collection, action.parentComponentId, {
                properties: [...concept.properties, property.id]
            });
            newCollection.push(property);
            // console.log('concept:', concept, ', property:', property,', newCollection:', newCollection);
            return {
                ...state,
                collection: newCollection,
            };
        case 'PROPERTY_DELETE':
            // console.log('PROPERTY_DELETE > action:', action);
            concept = util.findConcept(collection, action.parentComponentId);
            const newProperties = concept.properties.filter((pId) => pId !== action.id);
            newCollection = updateCollectionConcept(collection, action.parentComponentId, {
                properties: newProperties
            });
            newCollection = removeConceptFromCollection(newCollection, action.id)
            // console.log('concept:',concept, '\nnewProperties:', newProperties, '\nnewCollection:', newCollection, '\n\n');
            return {
                ...state,
                collection: newCollection
            };
        case 'PROPERTY_CHANGE':
                // console.log('PROPERTY_CHANGE > action:', action);
                return {
                    ...state,
                };
        case 'VIEW_FILTER_CHANGE':
            return {
                ...state,
                viewFilter: action.index
            };
        default:
            return state;
    }
}

const groupNames = (state = {0: '', 1: '', 2: '', 3: '', 4: '', 5: ''}, action) => {
    // console.log('groupName\naction:', action, ', \nstate:', state);
    switch (action.type) {
        case 'GROUP_NAME_CHANGE':
            return {...state, [action.index]: action.name};
        default:
            return state;
    }
}

const info = (state = {author: '', name: '', date: ''}, action) => {
    const {type, ...newState} = action;
    switch (action.type) {
        case 'INFO_CHANGE':
            return {
                ...state,
                ...newState
            };
        default:
            return state;
    }
}

const scenarios = (state = [], action) => {
    switch (action.type) {
        case 'ADD_SCENARIO':
            return state;
        default:
            return state;
    }
}

const appReducers = combineReducers({
    concepts,
    groupNames,
    info,
    scenarios
});

const allReducers = (state, action) => {
    // console.log('allReducers, action:', action);
    if (action.type === 'MODEL_LOAD') {
        state = action.state || {}
    }
    return appReducers(state, action);
}

export default allReducers;