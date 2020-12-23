import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import Relationship from '../Relationship/Relationship';
import util from '../../utils/util';

class Relationships extends PureComponent {
    render() {
        const {positions, concepts} = this.props;
        let {collection, selectedConcept, selectedRelationship, tempRelationship, viewFilter} = concepts;
        if (false) {
            tempRelationship = {
                startX: 400,
                endX: 400,
                startY: 400,
                endY: 700,
                id: 14,
                width: 100,
                height: 100,
                centerClickDiffX: 0,
                centerClickDiffY: 0
            };
        }
        return (
            <div className="map__relationships">
            {
                collection.map((concept) => {
                    const relationships = concept.relationships || [];
                    return relationships.map((relationship) => {
                        const {
                            id: influenceeId,
                            ...rest
                        } = relationship;
                        const {
                            x: influenceeX,
                            y: influenceeY,
                            width: influenceeWidth,
                            totalHeight: influenceeHeight
                        } = util.getPosition(influenceeId, positions);
                        const influencerId = concept.id; 
                        const {
                            x: influencerX,
                            y: influencerY,
                            width: influencerWidth,
                            totalHeight: influencerHeight,
                        } = util.getParentConcept({collection, concept});
                        const isExcludedByFilter = false;
                        {/* const isExcludedByFilter = util.isRelationshipExcludedByFilter({
                                viewFilter,
                                selectedConcept,
                                concept,
                                influencerId,
                                influenceeId,
                                collection
                            }); */}
                        const comboId = `relationship_${influencerId}_to_${influenceeId}`
                        // console.log(comboId);
                        return (
                            <Relationship
                                {...rest}
                                key={comboId}
                                comboId={comboId}
                                hasTempRelationship={!!tempRelationship}
                                influenceeId={influenceeId}
                                influenceeX={influenceeX}
                                influenceeY={influenceeY}
                                influenceeWidth={influenceeWidth}
                                influenceeHeight={influenceeHeight}
                                influencerId={influencerId}
                                influencerX={influencerX}
                                influencerY={influencerY}
                                influencerWidth={influencerWidth}
                                influencerHeight={influencerHeight}
                                selected={selectedConcept === influencerId && selectedRelationship === influenceeId}
                                isExcludedByFilter={isExcludedByFilter}
                            />
                        );
                    })
                })
            }
            {/* {tempRelationship && console.log(tempRelationship.height)} */}
            {tempRelationship &&
                <Relationship
                    className="Relationship--temp"
                    key="tempRelationship"
                    influenceeX={tempRelationship.endX}
                    influenceeY={tempRelationship.endY}
                    // influenceeWidth={tempRelationship.width / 2}
                    // influenceeHeight={tempRelationship.height + 15}
                    influenceeWidth={tempRelationship.width}
                    influenceeHeight={tempRelationship.height}
                    influencerX={tempRelationship.startX}
                    influencerY={tempRelationship.startY}
                    // influencerWidth={tempRelationship.width / 2}
                    // influencerHeight={tempRelationship.height + 15}
                    influencerWidth={tempRelationship.width}
                    influencerHeight={tempRelationship.height}
                    centerClickDiffX={tempRelationship.centerClickDiffX}
                    centerClickDiffY={tempRelationship.centerClickDiffY}
                    selected={false}
                    influence={0}
                    tempLine={true}
                    hasTempRelationship={!!tempRelationship}                            
                />
            }
            </div>
        );
    }
}            

const mapStateToProps = (state) => {
    const {concepts} = state;
    // console.log('\n-------Relationships > mapStateToProps\nstate:', state, '\n\n');
    const positions = util.getConceptsPosition(concepts.collection);
    return {
        concepts,
        positions
    };
}

export default connect(mapStateToProps)(Relationships);