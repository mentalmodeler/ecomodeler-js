import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import {relationshipFocus} from '../../actions/index';

import RelationshipValueDisplay from '../RelationshipValueDisplay/RelationshipValueDisplay';
import util from '../../utils/util';

import './Relationship.css';

const arrowheadHeight = 16; // 6
const arrowheadWidth = 16; // 9

class Relationship extends Component {
    static defaultProps = {
        influence: 0
    }

    constructor(props) {
        super(props);
        this.state = {
            justMounted: false
        };        
    }

    componentDidMount() {
        if (this.props.selected) {
            this.setState({
                justMounted: true
            });
        }
    }

    componentDidUpdate() {
        if (this.state.justMounted) {
            this.setState({
                justMounted: false
            });
        }
    }
    
    shouldComponentUpdate(nextProps, nextState) {
        const shouldUpdate = [
            nextProps.influenceeX !== this.props.influenceeX,
            nextProps.influenceeY !== this.props.influenceeY,
            nextProps.influenceeWidth !== this.props.influenceeWidth,
            nextProps.influenceeHeight !== this.props.influenceeHeight,
            nextProps.influencerX !== this.props.influencerX,
            nextProps.influencerY !== this.props.influencerY,
            nextProps.influencerWidth !== this.props.influencerWidth,
            nextProps.influencerHeight !== this.props.influencerHeight,
            nextProps.selected !== this.props.selected,
            nextProps.tempLine !== this.props.tempLine,
            nextProps.hasTempRelationship !== this.props.hasTempRelationship,
            nextProps.inDualRelationship !== this.props.inDualRelationship,
            nextProps.isExcludedByFilter !== this.props.isExcludedByFilter,
            nextProps.influence !== this.props.influence,
            nextState.justMounted === true && this.state.justMounted === false
        ].some((cond) => (!!cond));
        return shouldUpdate;
    }

    setRef = (ref) => {
        this.root = ref;
    }

    onClick = (e) => {
        const {influencerId, influenceeId, relationshipFocus} = this.props;
        console.log('Relationship > onClick');
        relationshipFocus(influencerId, influenceeId);
    }

    render() {
        const {
            influence,
            influenceeId,
            influenceeX,
            influenceeY,
            influenceeWidth,
            influenceeHeight,
            influencerId,
            influencerX,
            influencerY,
            influencerWidth,
            influencerHeight,
            centerClickDiffX,
            centerClickDiffY,
            selected,
            className,
            tempLine,
            hasTempRelationship,
            inDualRelationship,
            isFirstInDualRelationship,
            isExcludedByFilter,
            label
        } = this.props

        // console.log('Relationship > render >', influencerId, '-', influenceeId, '\n\tinDualRelationship:', inDualRelationship, ', isFirstInDualRelationship:', isFirstInDualRelationship);
        const sizeData = [influenceeWidth, influenceeHeight, influencerWidth, influencerHeight];
        const missingSomeSizeData = sizeData.some((value) => (!value));
        if (missingSomeSizeData && !tempLine) {
            return null;
        }

        const dualRelationshipHeight = Math.min(influencerHeight, influenceeHeight);
        const influenceAbsValue = Math.abs(influence);
        const lineThickness = Math.round(influenceAbsValue * 3 + 1);
        let erX = influencerX + influencerWidth / 2 + util.getOffsetX({inDualRelationship, isFirstInDualRelationship});
        let erY = influencerY + influencerHeight / 2 + util.getOffsetY({inDualRelationship, isFirstInDualRelationship, height: dualRelationshipHeight});
        let eeX = influenceeX + influenceeWidth / 2 + util.getOffsetX({inDualRelationship, isFirstInDualRelationship});
        let eeY = influenceeY + influenceeHeight / 2 + util.getOffsetY({inDualRelationship, isFirstInDualRelationship, height: dualRelationshipHeight});
        if (!tempLine) {
            const edgeEE = util.determineEdgePoint({
                eeX,
                eeY,
                erX,
                erY,
                eeWidth: influenceeWidth,
                eeHeight: influenceeHeight,
                inDualRelationship,
                isFirstInDualRelationship,
                dualRelationshipHeight
            });
            eeX = edgeEE.x;
            eeY = edgeEE.y;
            
            const edgeEr = util.determineEdgePoint({
                eeX : erX,
                eeY: erY,
                erX: eeX,
                erY: eeY,
                eeWidth: influencerWidth,
                eeHeight: influencerHeight,
                inDualRelationship,
                isFirstInDualRelationship,
                dualRelationshipHeight
            });
            erX  = edgeEr.x;
            erY  = edgeEr.y;
        } else {
            erX = influencerX;
            erY = influencerY;
            eeX = influenceeX + centerClickDiffX;
            eeY = influenceeY + centerClickDiffY;
        }
        
        let influenceModifier = selected ? 'selected' : 'neutral';
        let color = selected ? '#d44c36' : '#333';
        const rootClassname = classnames('Relationship', className, {
            'Relationship--has-temp-relationship': hasTempRelationship,
            'Relationship--excluded-by-filter': isExcludedByFilter,
            'Relationship--temp-line' : tempLine
        });
        // console.log('rootClassname:', rootClassname);
        // if ([isNaN(erX), isNaN(erY), isNaN(eeX), isNaN(eeY)].some((conditon) => (!!conditon))) {
        if (isNaN(erX)) {
            return  <span className={rootClassname}></span>
        }
        return (
            <span className={rootClassname}>
                <svg
                    className="Relationship__svg Relationship__svg--line"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <line
                        x1={erX}
                        x2={eeX}
                        y1={erY}
                        y2={eeY}
                        stroke={color}
                        strokeWidth={tempLine ? 2 : lineThickness}
                    />
                </svg>
                <svg
                    className="Relationship__svg Relationship__svg--hit"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    onClick={this.onClick}
                >   
                    <defs>
                        <marker
                            id="semi-circle-neutral"
                            orient="auto"
                            refX="1"
                            refY="1"
                        >
                            <circle cx="1" cy="1" r="1" fill="#333" />
                        </marker>
                        <marker
                            id="semi-circle-selected"
                            orient="auto"
                            refX="1"
                            refY="1"
                        >
                            <circle cx="1" cy="1" r="1" fill="#d44c36" />
                        </marker>
                        <marker
                            id="arrow-neutral"
                            markerWidth={`${arrowheadWidth}`}
                            markerHeight={`${arrowheadHeight}`}
                            refX={`${arrowheadWidth}`}
                            refY={`${arrowheadHeight/2}`}
                            orient="auto"
                            markerUnits="userSpaceOnUse"
                        >
                            <path
                                d={`M0,0 L0,${arrowheadHeight} L${arrowheadWidth},${arrowheadHeight / 2} z`}
                                fill={'#333'}
                            />
                        </marker>
                        <marker
                            id="arrow-negative"
                            markerWidth={`${arrowheadWidth}`}
                            markerHeight={`${arrowheadHeight}`}
                            refX={`${arrowheadWidth}`}
                            refY={`${arrowheadHeight/2}`}
                            orient="auto"
                            markerUnits="userSpaceOnUse"
                        >
                            <path
                                d={`M0,0 L0,${arrowheadHeight} L${arrowheadWidth},${arrowheadHeight / 2} z`}
                                fill={'#BF5513'}
                            />
                        </marker>
                        <marker
                            id="arrow-positive"
                            markerWidth={`${arrowheadWidth}`}
                            markerHeight={`${arrowheadHeight}`}
                            refX={`${arrowheadWidth}`}
                            refY={`${arrowheadHeight/2}`}
                            orient="auto"
                            markerUnits="userSpaceOnUse"
                        >
                            <path
                                d={`M0,0 L0,${arrowheadHeight} L${arrowheadWidth},${arrowheadHeight / 2} z`}
                                fill={'#0351A6'}
                            />
                        </marker>
                        <marker
                            id="arrow-selected"
                            markerWidth={`${arrowheadWidth}`}
                            markerHeight={`${arrowheadHeight}`}
                            refX={`${arrowheadWidth}`}
                            refY={`${arrowheadHeight/2}`}
                            orient="auto"
                            markerUnits="userSpaceOnUse"
                        >
                            <path
                                d={`M0,0 L0,${arrowheadHeight} L${arrowheadWidth},${arrowheadHeight / 2} z`}
                                fill={'#d44c36'}
                            />
                        </marker>
                    </defs>
                    <line
                        x1={erX}
                        x2={eeX}
                        y1={erY}
                        y2={eeY}
                        stroke="transparent"
                        strokeWidth="6"
                        markerStart={`url(#semi-circle-${influenceModifier})`}
                        markerEnd={`url(#arrow-${influenceModifier})`}
                    />
                </svg>
                {!tempLine && 
                    <RelationshipValueDisplay
                        erX={erX}
                        eeX={eeX}
                        erY={erY}
                        eeY={eeY}
                        influencerId={influencerId}
                        influenceeId={influenceeId}
                        influence={influence}
                        label={label}
                        expanded={this.state.justMounted}
                    />
                }
            </span>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        relationshipFocus: (influencerId, influenceeId) => {
            dispatch(relationshipFocus(influencerId, influenceeId))
        }
    };
}

export default connect(null, mapDispatchToProps)(Relationship);
