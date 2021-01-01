import React, { Component } from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';
import debounce from 'lodash.debounce';
import ReactDOM from 'react-dom';

import {
    relationshipChangeLabel,
    relationshipDelete,
    relationshipFocus
} from '../../actions/index';

import './RelationshipValueDisplay.css';

const DELETE_AND_EDIT_WIDTH = 80;
const DELETE_AND_EDIT_HEIGHT = 30;
const TEXTAREA_WIDTH = 305;
const TEXTAREA_HEIGHT = 50;
const LABEL_LINE_HEIGHT = 24;
const INPUT_LINE_HEIGHT = 18;
const MAX_NUM_LINES = 2;

const hasScrollOverflow = (elem) => elem && elem.scrollHeight && elem.scrollHeight > (MAX_NUM_LINES * LABEL_LINE_HEIGHT);
const nameChanged = (state, prevState) => state.value !== prevState.value;

class RelationshipValueDisplay extends Component {
    constructor(props) {
        super(props);
       
        this.state = {
            expanded: false, // are the delete and edit buttons shown
            editing: false, // is the tet input shown
            descriptionLabel: props.label || ''
        }
        this.inputRef = React.createRef();
    }
    
    componentDidUpdate(prevProps, prevState) {
        // TODO: handle prop label and temp label state
        // const stateChanges = {};
        // let stateDidChange = false;
        // if (this.props.label !== prevProps.label) {
        //     stateDidChange = true;
        //     stateChanges.descriptionLabel = this.props.label;
        // }

        if (this.state.editing && this.state.editing !== prevState.editing && this.inputRef.current) {
            this.inputRef.current.focus();
        }
    }

    onInputBlur = (e) => {
        console.log('onInputBlur')
        if (this.state.editing) {
            this.setTextValue();
            this.setState({
                editing: false
            });
        }
    }

    onChangeDescriptionLabel = (e) => {
        const {descriptionLabel} = this.state;
        const newValue = e.target.value;

        if (newValue !== descriptionLabel && !hasScrollOverflow(e.target)) {
            this.setState({
                descriptionLabel: newValue
            });

            // make debounced call to update the store with updated label
            this.debouncedChangeDescriptionLabel();
        }
    }

    onKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.stopPropagation();
            e.preventDefault();
            // const labelChanged = this.props.label !== this.state.descriptionLabel;
            this.setState({
                editing: false,
                expanded: false, // this.state.mouseOver
            });
            // this.setTextValue();
        }
    }

    setTextValue = () => {
        const {descriptionLabel} = this.state;
        const {influencerId, influenceeId, relationshipChangeLabel} = this.props;
        relationshipChangeLabel(influencerId, influenceeId, descriptionLabel);
    }

    debouncedChangeDescriptionLabel = debounce(this.setTextValue, 150);

    onClickDelete = (e) => {
        // console.log('RelationshipValueDisplay > onClickDelete');
        const {influencerId, influenceeId, relationshipDelete} = this.props;
        // prevent onClick from being handled, which will 
        // try to set focus to just deleted relationship
        e.stopPropagation();
        relationshipDelete(influencerId, influenceeId);
    }

    onClickEdit = (e) => {
        if(!this.state.editing) {
            this.setState({
                editing: true,
                expanded: false
            });
        }
    }

    onClick = (e) => {
        const {influencerId, influenceeId, relationshipFocus} = this.props;
        relationshipFocus(influencerId, influenceeId);
    }

    onMouseEnter = (e) => {
        this.toggleMenu(true);
    }

    onMouseLeave = (e) => {
        this.toggleMenu(false);
    }
    
    toggleMenu = (show) => this.state.expanded !== show && this.setState({expanded: show, mouseOver: show});
    
    render = () => {
        const {expanded, descriptionLabel, editing} = this.state;
        const {erX, erY, eeX, eeY} = this.props;
        const cx = Math.round((erX + eeX) / 2);
        const cy = Math.round((erY + eeY) / 2);

        if (!editing) {
            const textPadding = 24;
            const dist = Math.round(Math.sqrt(Math.pow(eeX - erX, 2) + Math.pow(eeY - erY, 2)));
            const angle = Math.round(Math.atan2(eeY - erY, eeX - erX) * (180 / Math.PI));
            const textAngle = (angle >= -90 && angle <= 90) ? angle : 180 + angle;
            const x = Math.round(((erX - cx) * Math.cos(angle * Math.PI / 180) + (erY - cy) * Math.sin(angle * Math.PI / 180)) + cx);
            const y = Math.round((-(erX - cx) * Math.sin(angle * Math.PI / 180) + (erY - cy) * Math.cos(angle * Math.PI / 180)) + cy);
            const textBoxStyle = { 
                left: `${x}px`, 
                top: `${y - (LABEL_LINE_HEIGHT + 1)}px`, 
                transform: `rotate(${textAngle}deg)`, 
                width: `${dist}px`,
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: MAX_NUM_LINES,
            };
            const textContentStyle = { 
               
                
                width: `${dist}px`
            };
            const expandedPosStyle = {
                left: `${cx - (DELETE_AND_EDIT_WIDTH / 2)}px`,
                top: `${cy - (DELETE_AND_EDIT_HEIGHT / 2)}px`,
                zIndex: '3'
            };
            return (
                <div 
                    className="relationship-value-display"
                    onMouseEnter={this.onMouseEnter}
                    onMouseLeave={this.onMouseLeave}
                    onClick={this.onClick}
                >
                    <div 
                        className="relationship-value-display__text" 
                        style={textBoxStyle}
                    >
                        {descriptionLabel ? descriptionLabel : 'Enter line description'}
                    </div>
                    {expanded && 
                        <div 
                            className="relationship-value-display__delete-and-edit"
                            style={expandedPosStyle} 
                        >
                            <button className="relationship-value-display__delete" onClick={this.onClickDelete}>
                                <svg className="relationship-value-display__delete-icon" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 900.5 900.5">
                                <g>
                                    <path d="M176.415,880.5c0,11.046,8.954,20,20,20h507.67c11.046,0,20-8.954,20-20V232.487h-547.67V880.5L176.415,880.5z
                                        M562.75,342.766h75v436.029h-75V342.766z M412.75,342.766h75v436.029h-75V342.766z M262.75,342.766h75v436.029h-75V342.766z"/>
                                    <path d="M618.825,91.911V20c0-11.046-8.954-20-20-20h-297.15c-11.046,0-20,8.954-20,20v71.911v12.5v12.5H141.874
                                        c-11.046,0-20,8.954-20,20v50.576c0,11.045,8.954,20,20,20h34.541h547.67h34.541c11.046,0,20-8.955,20-20v-50.576
                                        c0-11.046-8.954-20-20-20H618.825v-12.5V91.911z M543.825,112.799h-187.15v-8.389v-12.5V75h187.15v16.911v12.5V112.799z"/>
                                </g>
                                </svg>
                            </button>
                            <button className="relationship-value-display__edit" onClick={this.onClickEdit}>
                                <svg className="relationship-value-display__edit-icon" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 600 600">
                                    <g stroke="#ffffff" fill="none">
                                        <path id="rect2990" d="m70.064 422.35 374.27-374.26 107.58 107.58-374.26 374.27-129.56 21.97z" strokeWidth="50"/>
                                        <path id="path3771" d="m70.569 417.81 110.61 110.61" strokeWidth="50"/>
                                        <path id="path3777" d="m491.47 108.37-366.69 366.68" strokeWidth="50"/>
                                        <path id="path3763" d="m54.222 507.26 40.975 39.546" strokeWidth="50"/>
                                    </g>
                                </svg>
                            </button>
                        </div>
                    }
                </div>
            );
        }
        else {
            const domNode = document && document.querySelector('.MentalMapper .map__content');
            const editingPosStyle = {
                left: `${cx - (TEXTAREA_WIDTH / 2)}px`,
                top: `${cy - (TEXTAREA_HEIGHT / 2)}px`
            };

            return ReactDOM.createPortal(
                <div
                    className="relationship-value-display__edit-wrapper"
                    style={editingPosStyle}
                >
                    <textarea
                        className="relationship-value-display__input"
                        ref={this.inputRef}
                        value={descriptionLabel}
                        onKeyDown={this.onKeyDown}
                        onChange={this.onChangeDescriptionLabel}
                        maxLength="138"
                        wrap="soft"
                        onBlur={this.onInputBlur}
                    />
                </div>,
                domNode
            );
        }
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        relationshipChangeLabel: (influencerId, influenceeId, value) => {
            dispatch(relationshipChangeLabel(influencerId, influenceeId, value))
        },

        relationshipDelete: (influencerId, influenceeId) => {
            dispatch(relationshipDelete(influencerId, influenceeId))
        },

        relationshipFocus: (influencerId, influenceeId) => {
            dispatch(relationshipFocus(influencerId, influenceeId))
        }
    };
}

export default connect(null, mapDispatchToProps)(RelationshipValueDisplay);