import React, { Component } from 'react';
import { connect } from 'react-redux';
import debounce from 'lodash.debounce';
import classnames from 'classnames';

import {
    renderAddButton,
    renderDeleteButton,
    renderLineButton,
} from './ConceptDisplays';

import {
    propertyAdd,
    propertyDelete,
    conceptMove,
    conceptFocus,
    conceptChange,
    conceptDelete,
    relationshipDrawTemp,
    relationshipSetTempTarget,
    relationshipAdd,
    relationshipFocus
} from '../../actions/index';

import './Concept.css';

const useInput = true;
const CONCEPT_PADDING = 2;
const CONCEPT_WIDTH = 204;
const CONCEPT_HEIGHT = 32;
const hasScrollOverflow = (elem) => elem && elem.scrollWidth && elem.scrollWidth > CONCEPT_WIDTH - (CONCEPT_PADDING * 2);
const nameChanged = (state, prevState) => state.value !== prevState.value;
const propertiesChanged = (props, prevProps) => !props.parentComponent && (props.properties.length !== prevProps.properties.length);

class Concept extends Component {
    static defaultProps = {
        properties: [],
    };

    constructor(props) {
        super(props);

        this.state = {
            value: this.props.name || '',
            isOver: false,
            lineMouseDown: false,
        }

        this.height = 30; // 18px line-height + 6px each topa dn bottom padding
        this.width = 0;
        this.totalHeight = 0;
        this.centerClickDiffX = 0;
        this.centerClickDiffY = 0;
        this.xBeforeDrag = 0;
        this.yBeforeDrag = 0;
    }


    componentDidMount() {
        if (this.textarea) {
            // this.textarea.style.overflow = 'hidden';
            // this.autoExpand();
            this.conceptChange()
        }
    }

    componentDidUpdate(prevProps, prevState) {
        // const {properties, parentComponentId} = this.props;
        // const valueChanged = this.state.value !== prevState.value;
        // if (valueChanged) {
        //     this.autoExpand();
        // }
        // if (!parentComponentId && properties.length !== prevProps.properties.length) {
        //     // console.log('updateHeight');
        //     this.debouncedConceptChange();
        // }
        if (nameChanged(this.state, prevState) || propertiesChanged(this.props, prevProps)) {
            this.debouncedConceptChange();
        }
    }

    conceptChange = () => {
        const {id, parentComponentId, conceptChange, properties} = this.props;
        this.width = CONCEPT_WIDTH;
        this.height = CONCEPT_HEIGHT;
        this.totalHeight = !parentComponentId
            ? this.height + properties.length * CONCEPT_HEIGHT
            : this.height;
        conceptChange(id, this.state.value, this.width, this.height, this.totalHeight);
    }

    debouncedConceptChange = debounce(this.conceptChange, 150);

    toggleDragHandlers(on, e) {
        const func = on ? 'addEventListener' : 'removeEventListener';
        window[func]('mousemove', this.onMouseMove);
        window[func]('mouseup', this.onMouseUp);
    }

    onChange = (e) => {
        const { value } = this.state;
        const newValue = e.target.value;
        if (newValue !== value && !hasScrollOverflow(e.target)) {
            this.setState({
                value: newValue
            });
        }
    }

    getSelectedConceptData() {
        const data = {};
        ['id', 'name', 'notes', 'units', 'preferredState', 'group', 'relationships', 'x', 'y', 'width', 'height'].forEach((key) => {
            data[key] = this.props[key];
        });
        return data;
    }

    onMouseDown = (e) => {
        const {id, selected, conceptFocus, parentComponent} = this.props;
        let {x, y} = this.props;
        if (parentComponent) { // && typeof x === 'undefined') {
            x = parentComponent.x;
        }
        if (parentComponent) { // && typeof y === 'undefined') {
            y = parentComponent.y;
        }
        const lineButtonMouseDown = e.target === this.lineButtonRef;
        
        // store positions
        this.screenXBeforeDrag = e.screenX;
        this.screenYBeforeDrag = e.screenY;
        this.xBeforeDrag = parseInt(x, 10);
        this.yBeforeDrag = parseInt(y, 10);

        if (lineButtonMouseDown) {
            const rect = this.root.getBoundingClientRect();
            const middleX = rect.x + rect.width / 2;
            const middleY = rect.y + rect.height / 2;
            this.centerClickDiffX = e.clientX - middleX;
            this.centerClickDiffY = e.clientY - middleY;
            this.xBeforeDrag = middleX;
            this.yBeforeDrag = middleY;

            // NEW
            e.stopPropagation();
        }

        if (!selected) {
            conceptFocus(id);
        }

        if (lineButtonMouseDown && !this.state.lineMouseDown) {
            this.setState({
                lineMouseDown: true
            });
        }
        
        this.toggleDragHandlers(true, e);
    }

    onMouseMove = (e) => {
        const {id, parentComponentId, conceptMove, relationshipDrawTemp} = this.props; // eslint-disable-line
        const {lineMouseDown} = this.state;
        const deltaX = e.screenX - this.screenXBeforeDrag;
        const deltaY = e.screenY - this.screenYBeforeDrag;
        const newX = Math.max(deltaX + this.xBeforeDrag, 0);
        const newY = Math.max(deltaY + this.yBeforeDrag, 0);
        const dragId = parentComponentId || id;
        if (lineMouseDown) {
            relationshipDrawTemp(id /* dragId */, true, this.xBeforeDrag, this.yBeforeDrag, newX, newY, this.width, this.height, this.centerClickDiffX, this.centerClickDiffY);
        } else {
            conceptMove(dragId, newX, newY);
        }
    }

    onMouseUp = (e) => {
        const {id, relationshipDrawTemp, relationshipAdd, tempTarget} = this.props;
        const {lineMouseDown} = this.state;
        this.toggleDragHandlers(false, e);
        if (lineMouseDown) {
            if (!!tempTarget && id !== tempTarget) { // && !isIntraConceptRelationship) {
                relationshipAdd(id, tempTarget);
            }
            this.centerClickDiffX = 0;
            this.centerClickDiffY = 0;
            relationshipDrawTemp(id, false);
            this.setState({
                lineMouseDown: false
            });
        }
    }

    onMouseOver = (e) => {
        const {id, hasTempRelationship, relationshipSetTempTarget} = this.props;
        if (hasTempRelationship) {
            relationshipSetTempTarget(id)
        }
    }

    onMouseOut = (e) => {
        const {hasTempRelationship, relationshipSetTempTarget} = this.props;
        if (hasTempRelationship) {
            relationshipSetTempTarget(null)
        }
    }

    onFocus = (e) => {
        const {id, selected, conceptFocus} = this.props;
        if (!selected) {
            conceptFocus(id);
        }
    }

    // REMOVED
    onBlur = (e) => {}

    setRef = (ref) => {
        this.root = ref;
    }

    setTextareaRef = (ref) => {
        this.textarea = ref;
    }

    onClickAdd = (e) => {
        const {id, propertyAdd} = this.props;
        propertyAdd(id);    
    }

    onClickDelete = (e) => {
        const {id, parentComponentId, propertyDelete, conceptDelete} = this.props;
        return parentComponentId
            ? propertyDelete(id, parentComponentId)
            : conceptDelete(id);
    }
    
    setLineButtonRef = (ref) => {
        this.lineButtonRef = ref;
    }

    render() {
        const {id, parentComponentId, selected, selectedRelationship, isIntraConceptRelationship, group = '0', hasTempRelationship, isTempRelationship, isExcludedByFilter, parentComponent, properties} = this.props; // eslint-disable-line
        const { value, lineMouseDown } = this.state;
        const isSub = !!parentComponentId;
        const groupNum = group || '0';
        const rootClassnames = classnames('Concept', `Concept--group-${groupNum}`, {
            'Concept--focused': selected,
            'Concept--line-mouse-down': lineMouseDown,
            'Concept--temp-relationship-exists': hasTempRelationship,
            'Concept--temp-relationship-is-intraconcept': isIntraConceptRelationship,
            'Concept--is-temp-relationship': isTempRelationship,
            'Concept--excluded-by-filter': isExcludedByFilter
        });
        const bgClassnames = classnames('Concept__bg', `Concept__bg--group-${groupNum}${isSub ? "-sub" : ""}`, {
            'Concept__bg--focused': selected,
            'Concept__bg--relationship-focused': selectedRelationship,
            'Concept__bg--sub': isSub
        });
        const textAreaClassnames = classnames('Concept__textarea', {
            'Concept__textarea--sub': isSub
        });
        
        const bgStyle = {
            // borderRadius: '0px',
            // border: '1px solid #4c4c4c',
            // boxShadow: 'inset 0 0 0 2px #fff, 0 3px 8px rgba(0, 0, 0, 0.15)'
        };
        const placeholder = isSub ? "Enter property" : "Enter component";
        return  (
            <div
                className={rootClassnames}
                ref={this.setRef}
                onMouseDown={this.onMouseDown}
                onMouseOver={this.onMouseOver}
                onMouseOut={this.onMouseOut}
                dataid={id}
            >
                {!useInput && (
                    <textarea
                        className={textAreaClassnames}
                        value={value}
                        onFocus={this.onFocus}
                        onChange={this.onChange}
                        ref={this.setTextareaRef}
                        placeholder={placeholder}
                        // rows={1}
                        // style={getTextAreaStyle()}
                    />
                )}
                {useInput && (
                    <input
                        type="text"
                        className={textAreaClassnames}
                        value={value}
                        onFocus={this.onFocus}
                        onChange={this.onChange}
                        ref={this.setTextareaRef}
                        placeholder={placeholder}
                        // rows={1}
                        // style={getTextAreaStyle()}
                    />
                )}
                {!isSub &&
                    renderAddButton(this.onClickAdd)
                }
                {renderDeleteButton(this.onClickDelete)}
                {renderLineButton(this.setLineButtonRef)}
                <div className={bgClassnames} style={bgStyle}></div>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        propertyAdd: (parentComponentId) => {
            dispatch(propertyAdd(parentComponentId))
        },

        propertyDelete: (id, parentComponentId) => {
            dispatch(propertyDelete(id, parentComponentId))
        },

        conceptMove: (id, x, y) => {
            dispatch(conceptMove(id, x, y))
        },

        conceptFocus: (id) => {
            dispatch(conceptFocus(id))
        },

        conceptChange: (id, text, width, height, totalHeight) => {
            dispatch(conceptChange(id, text, width, height, totalHeight))
        },

        conceptDelete: (id) => {
            dispatch(conceptDelete(id))
        },

        relationshipDrawTemp: (id, drawing, startX, startY, endX, endY, width, height, centerClickDiffX, centerClickDiffY) => {
            dispatch(relationshipDrawTemp(id, drawing, startX, startY, endX, endY, width, height, centerClickDiffX, centerClickDiffY))
        },

        relationshipSetTempTarget: (id) => {
            dispatch(relationshipSetTempTarget(id));
        },

        relationshipAdd: (influencerId, influenceeId) => {
            dispatch(relationshipAdd(influencerId, influenceeId));
        },

        relationshipFocus: (influencerId, influenceeId) => {
            dispatch(relationshipFocus(influencerId, influenceeId));
        },
    };
}

export default connect(null, mapDispatchToProps)(Concept);