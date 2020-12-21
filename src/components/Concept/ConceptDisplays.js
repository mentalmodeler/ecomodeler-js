import React from 'react';

const renderAddIcon = () => (
    <svg className="Concept__icon--add" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 24 24">
        <g>
            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z"/>
        </g>
    </svg>
);

const renderTrashIcon = () => (
    <svg className="Concept__icon--trash" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 900.5 900.5">
        <g>
            <path d="M176.415,880.5c0,11.046,8.954,20,20,20h507.67c11.046,0,20-8.954,20-20V232.487h-547.67V880.5L176.415,880.5z
                M562.75,342.766h75v436.029h-75V342.766z M412.75,342.766h75v436.029h-75V342.766z M262.75,342.766h75v436.029h-75V342.766z"/>
            <path d="M618.825,91.911V20c0-11.046-8.954-20-20-20h-297.15c-11.046,0-20,8.954-20,20v71.911v12.5v12.5H141.874
                c-11.046,0-20,8.954-20,20v50.576c0,11.045,8.954,20,20,20h34.541h547.67h34.541c11.046,0,20-8.955,20-20v-50.576
                c0-11.046-8.954-20-20-20H618.825v-12.5V91.911z M543.825,112.799h-187.15v-8.389v-12.5V75h187.15v16.911v12.5V112.799z"/>
        </g>
    </svg>
);

const renderLineIcon = () => (
    <svg className="Concept__icon--line" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 612 612" style={{enableBackground: 'new 0 0 612 612'}} xmlSpace="preserve">
        <g transform="rotate(-90,306,306)">
            <path d="M306,0C137.012,0,0,136.992,0,306s137.012,306,306,306s306-137.012,306-306S475.008,0,306,0z M431.001,322.811
                l-108.19,108.19c-4.59,4.59-10.862,6.005-16.811,4.953c-5.929,1.052-12.221-0.382-16.811-4.953l-108.19-108.19
                c-7.478-7.478-7.478-19.583,0-27.042c7.478-7.478,19.584-7.478,27.043,0l78.833,78.814V172.125
                c0-10.557,8.568-19.125,19.125-19.125c10.557,0,19.125,8.568,19.125,19.125v202.457l78.814-78.814
                c7.478-7.478,19.584-7.478,27.042,0C438.46,303.227,438.46,315.333,431.001,322.811z"/>
        </g>
    </svg>
);

const renderAddButton = (callback) => (
    <div className="Concept__button-wrapper Concept__button-wrapper--top">
        <button
            className="Concept__button Concept__button--top"
            onClick={callback}
            tabIndex={-1}
        >
            {renderAddIcon()}
        </button>
    </div>
);

const renderDeleteButton = (callback) => (
    <div className="Concept__button-wrapper Concept__button-wrapper--left">
        <button 
            className="Concept__button Concept__button--left"
            onClick={callback}
            tabIndex={-1}
        >
            {renderTrashIcon()}
        </button>
    </div>
);

const renderLineButton = (callback) => (
    <div  className="Concept__button-wrapper Concept__button-wrapper--right">
        <button
            className="Concept__button Concept__button--right"
            ref={callback}
            tabIndex={-1}
        >
            {renderLineIcon()}
        </button>
    </div>
);

const getTextAreaStyle = () => ({
    lineHeight: '18px',
    fontSize: '14px',
    padding: '6px',
    fontFamily: '"Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
    color: '#333'
});

export {
    renderAddButton,
    renderDeleteButton,
    renderLineButton,
    getTextAreaStyle,
};
