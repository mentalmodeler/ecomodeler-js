import React from 'react';
import {connect} from 'react-redux';
import Concept from './Concept';

class ConceptStack extends React.Component {
    state = {
        height: 0,
        isDragging: false,
        startX: 0,
        startY: 0,
        translateX: 0,
        translateY: 0,
        lastTranslateX: 0,
        lastTranslateY: 0
    };

    constructor(props) {
        super(props);
        this.updateHeight = this.updateHeight.bind(this);
    }

    updateHeight() {
        const {concepts} = this.props;
        const [_, ...subconcepts] = concepts;
        let newHeight = subconcepts.reduce((totalHeight, subconcept) => {
            return totalHeight + subconcept.height;
        }, 0);

        this.setState({
            height: newHeight
        });
    }

    componentWillUnmount() {
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
    }

    onMouseDown = ({screenX, screenY}) => {
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);

        this.setState({
            startX: screenX,
            startY: screenY,
            isDragging: true
        });
    }

    onMouseMove = ({screenX, screenY}) => {
        const {isDragging} = this.state;

        if (!isDragging) { return; }

        const {startX, startY, lastTranslateX, lastTranslateY} = this.state;
        const deltaX = screenX - startX;
        const deltaY = screenY - startY;

        this.setState({
            translateX: Math.max(deltaX + lastTranslateX, 0),
            translateY: Math.max(deltaY + lastTranslateY, 0)
        });
    }

    onMouseUp = () => {
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);

        this.setState({
            startX: 0,
            startY: 0,
            lastTranslateX: this.state.translateX,
            lastTranslateY: this.state.translateY,
            isDragging: false
        });
    }

    render = () => {
        const {conceptId, concepts} = this.props;
        const {translateX, translateY, height} = this.state;
        const [_, ...subconcepts] = concepts;
        const posStyle = {
            position: 'absolute',
            left: `${translateX}px`,
            top: `${translateY}px`
        };
        // console.log('ConceptStack > render\n\tthis.props:', this.props);
        return (
            <div
                className="ConceptStack"
                onMouseDown={this.onMouseDown}
                style={posStyle}
            >
                <Concept
                    key={`concept_${conceptId}`}
                    updateStackHeight={this.updateHeight}
                    stackHeight={height}
                    {...this.props}
                />
                {subconcepts &&
                    subconcepts.map((subconcept) => {
                        // console.log('\tsubconcept:', subconcept);
                        return (
                            <Concept
                                key={`subconcept_${subconcept.id}`}
                                updateStackHeight={this.updateHeight}
                                stackHeight={height}
                                {...subconcept}
                            />
                        )
                    })
                }
            </div>
        );
    }
}

export default ConceptStack;