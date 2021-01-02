import React, { Component, Fragment } from 'react';
import {connect} from 'react-redux';

import {util, ELEMENT_TYPE} from '../../utils/util';
import ControlPanel from './ControlPanel';
import TextAreaControl from './TextAreaControl';
import SelectedControl from './SelectedControl';
import GroupControl from './GroupControl';

import {
    conceptChangeNotes,
    conceptChangeUnits,
    conceptChangeGroup,
    relationshipChangeConfidence,
    relationshipChangeNotes,
    viewFilterChange,
    groupNameChange
} from '../../actions/index';

import './Controls.css';

const mapStateToProps = (state) => {
    const {concepts, groupNames} = state;
    const {viewFilter} = concepts;
    const {selectedType, selectedData, associatedData} = util.getSelectedAndAssociatedData(concepts);
    
    return {
        selectedType,
        selectedData,
        associatedData,
        groupNames,
        viewFilter
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        conceptChangeNotes: (id, notes) => {
            dispatch(conceptChangeNotes(id, notes))
        },

        conceptChangeUnits: (id, units) => {
            dispatch(conceptChangeUnits(id, units))
        },

        conceptChangeGroup: (id, groupIndex) => {
            dispatch(conceptChangeGroup(id, groupIndex))
        },

        relationshipChangeConfidence: (influencerId, influenceeId, value) => {
            dispatch(relationshipChangeConfidence(influencerId, influenceeId, value))
        },

        relationshipChangeNotes: (influencerId, influenceeId, value) => {
            dispatch(relationshipChangeNotes(influencerId, influenceeId, value))
        },

        viewFilterChange: (index) => {
            dispatch(viewFilterChange(index))
        },

        groupNameChange:(index, name) => {
            dispatch(groupNameChange(index, name));
        }
    };
}

class Controls extends Component {
    onNotesChange = (value) => {}
    onNotesBlur = ({event, value, isDirty}) => {
        const {selectedType, selectedData, conceptChangeNotes, relationshipChangeNotes} = this.props;
        if (isDirty) {
            if (selectedType === 'concept') {
                conceptChangeNotes(selectedData.id, value);
            } else if (selectedType === 'relationship') {
                const {associatedData} = this.props;
                const {influencer, influencee} = associatedData;
                relationshipChangeNotes(influencer.id, influencee.id, value);
            }
        }
    }

    onUnitsChange = (value) => {}
    onUnitsBlur = ({event, value, isDirty}) => {
        const {selectedData, conceptChangeUnits} = this.props;
        if (isDirty) {
            conceptChangeUnits(selectedData.id, value);
        }
    }

    onGroupNameChange = ({event, groupIndex, value}) => {
        this.props.groupNameChange(groupIndex, value);
    }

    onGroupSelectionChange = ({event, groupIndex}) => {
        const {selectedData, conceptChangeGroup} = this.props;
        conceptChangeGroup(selectedData.id, groupIndex);
    }

    onConfidenceChange = (value) => {}
    onConfidenceBlur = ({event, value, isDirty}) => {
        const {associatedData, relationshipChangeConfidence} = this.props;
        const {influencer, influencee} = associatedData;
        if (isDirty) {
            relationshipChangeConfidence(influencer.id, influencee.id, value);
        }
    }

    onViewFilterChange = (index) => {
        const {viewFilter, viewFilterChange} = this.props;
        if (index !== viewFilter) {
            viewFilterChange(index);
        }
    }

    render() {
        const {selectedType, selectedData, associatedData, groupNames} = this.props;
        // console.log('Controls > render\nthis.props:', this.props, '\n\n');
        // const dataSource = selectedType === ELEMENT_TYPE.CONCEPT ? 'influencer' : 'relationship';

        return (
            <div className="controls">
                <div className="controls__logo">
                    <span>{'Eco'}</span>
                    <span>{'Modeler'}</span>
                </div>
                {!(selectedType || selectedData) &&
                    <div className="controls__bg-wrapper">
                        <div className="controls__bg">
                            {'EcoModeler'}
                        </div>
                    </div>
                }
                {selectedType && selectedData &&
                    <Fragment>
                        <SelectedControl
                            selectedType={selectedType}
                            selectedData={selectedData}
                            associatedData={associatedData}
                        />
                        <ControlPanel title="Notes" className="control-panel--notes">
                            <TextAreaControl
                                className="control-panel__body-content"
                                value={selectedData && selectedData.notes ? selectedData.notes : ''}
                                onChange={this.onNotesChange}
                                onBlur={this.onNotesBlur}
                                placeholder="Enter notes"
                            />
                        </ControlPanel>
                        {selectedType === ELEMENT_TYPE.CONCEPT && !selectedData.parentComponentId &&
                            <Fragment>
                                <ControlPanel title="Group">
                                    <GroupControl
                                        selectedType={selectedType}
                                        selectedData={selectedData}
                                        groupNames={groupNames}
                                        onNameChange={this.onGroupNameChange}
                                        onSelectionChange={this.onGroupSelectionChange}
                                    />
                                </ControlPanel>
                            </Fragment>
                        }
                    </Fragment>
                }
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Controls);
