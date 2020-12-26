import React, { Component } from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';
import debounce from 'lodash.debounce';
import ReactDOM from 'react-dom';

import {
    // relationshipChangeInfluence,
    relationshipChangeLabel,
    relationshipDelete,
    relationshipFocus
} from '../../actions/index';

import './RelationshipValueDisplay.css';

class RelationshipValueDisplay extends Component {
    constructor(props) {
        super(props);
       
        console.log('RelationshipValueDisplay > props:', props);
        this.state = {
            expanded: false,
            editing: false,
            descriptionLabel: ""
        }
        this.rootRef = React.createRef();
        this.textareaRef = React.createRef();
    }
    
    componentDidMount = () => {
        if (this.state.expanded || this.state.editing) {
            this.toggleWindowMouseDownListener(true);
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.label !== prevProps.label) {

        }
    }

    toggleWindowMouseDownListener = (enable) => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('mousedown', this.handleWindowMouseDown);

            if (enable) {
                window.addEventListener('mousedown', this.handleWindowMouseDown);
            }
        }
    }

    handleWindowMouseDown = (e) => {
        const expandedOrEditing = this.state.expanded || this.state.editing;
        const rootContainsTarget = this.root && this.root.contains(e.target);
        const rootIsTarget = this.root && this.root === e.target;
        console.log('handleWindowMouseDown\n\texpandedOrEditing:', expandedOrEditing, '\n\trootContainsTarget:', rootContainsTarget, ', rootIsTarget:', rootIsTarget, '\n\tthis.root:', this.root, ', e.target:', e.target);
        if (expandedOrEditing && this.root && !this.root.contains(e.target)) {
            // this.toggleWindowMouseDownListener(false);
            // this.setState({
            //     expanded: false,
            //     editing: false
            // });
        }
    }

    onChangeDescriptionLabel = (e) => {
        const {descriptionLabel} = this.state;
        const value = e.target.value;
        if (value !== descriptionLabel) {
            console.log('onChangeDescriptionLabel, value:', value);
            this.setState({
                descriptionLabel: value
            });
        }
        this.debouncedChangeDescriptionLabel();
    }

    setTextValue = () => {
        const {descriptionLabel} = this.state;
        const {influencerId, influenceeId, relationshipChangeLabel} = this.props;

        // this.setState({
        //     descriptionLabel: descriptionLabel,
        //     editing: false
        // });

        relationshipChangeLabel(influencerId, influenceeId, descriptionLabel);
    }

    debouncedChangeDescriptionLabel = debounce(this.setTextValue, 500);

    onKeyDown = (e) => {
        if (e.key === 'Enter') {
            this.setTextValue();
        }
    }

    onClickDelete = (e) => {
        const {influencerId, influenceeId, relationshipDelete} = this.props;
        relationshipDelete(influencerId, influenceeId);
    }

    onClickEdit = (e) => {
        if(!this.state.editing) {
            this.setState({
                editing: true,
                expanded: false
            });
            this.toggleWindowMouseDownListener(true);
        }
    }

    onClick = (e) => {
        const {influencerId, influenceeId, relationshipFocus} = this.props;
        relationshipFocus(influencerId, influenceeId);
    }

    onMouseEnter = (e) => {
        const {influencerId, influenceeId, relationshipFocus} = this.props;
        // relationshipFocus(influencerId, influenceeId);
        console.log('mouseEnter');
        this.expandMenu();
    }

    onMouseLeave = (e) => {
        console.log('mouseLeave');
        if (this.state.expanded) {
            this.setState({
                expanded: false
            });
            this.toggleWindowMouseDownListener(false);
        }
    }

    expandMenu = () => {
        if (!this.state.expanded) {
            this.setState({
                expanded: true
            });
            this.toggleWindowMouseDownListener(true);
        }
    }

    setRef = (ref) => {
        this.root = ref;

        const textArea = ref && this.root.querySelector("textarea");
        if (textArea) {
            textArea.focus();
        }
    }

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
            const expandedClassNames = classnames('relationship-value-display', {
                'relationship-value-display--expanded': expanded,
                // 'relationship-value-display__expanded': expanded
            });
            const textBoxStyle = { 
                left: `${x}px`, 
                top: `${y - textPadding / 2}px`, 
                transform: `rotate(${textAngle}deg)`, 
                paddingBottom: `${textPadding}px`,
                width: `${dist}px` 
            };
            const expandedPosStyle = {
                left: `${cx - 40}px`,
                top: `${cy - 12}px`,
                zIndex: '3'
            };

            return (
                <div 
                    // className="relationship-value-display__wrapper"
                    className="relationship-value-display"
                    onMouseEnter={this.onMouseEnter}
                    onMouseLeave={this.onMouseLeave}
                    onClick={this.onClick}
                >
                    <div 
                        key="descriptionLabel" 
                        // className="relationship-value-display relationship-value-display__text"
                        className="relationship-value-display__text" 
                        style={textBoxStyle}
                        ref={this.setRef}
                    >
                        {descriptionLabel ? descriptionLabel : 'Enter line description'}
                    </div>
                    {expanded && 
                        <div 
                            key="relationship-value-edit-delete"
                            // className={expandedClassNames}
                            // className="relationship-value-display relationship-value-display--expanded relationship-value-display__expanded"
                            className="relationship-value-display__delete-and-edit"
                            style={expandedPosStyle} 
                            ref={this.setRef}>
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
                left: `${cx - 150}px`,
                top: `${cy - 18}px`
            };

            return ReactDOM.createPortal(
                <div
                    // className="relationship-value-display relationship-value-display__edit-wrapper"
                    className="relationship-value-display__edit-wrapper"
                    style={editingPosStyle}
                    ref={this.setRef}
                >
                    <textarea
                        // className="relationship-value-display relationship-value-display__input"
                        className="relationship-value-display__input"
                        ref={}
                        value={descriptionLabel}
                        onKeyDown={this.onKeyDown}
                        onChange={this.onChangeDescriptionLabel}
                        maxLength="138"
                        wrap="soft"
                    />
                </div>,
                domNode
            );
        }
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        // relationshipChangeInfluence: (influencerId, influenceeId, value) => {
        //     dispatch(relationshipChangeInfluence(influencerId, influenceeId, value))
        // },

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