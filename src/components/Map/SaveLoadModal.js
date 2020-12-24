import React, {Component} from 'react';
import {connect} from 'react-redux';
import classnames from 'classnames';
import {CSSTransition, TransitionGroup} from 'react-transition-group';

import {
    infoChange
} from '../../actions/index';

import './SaveLoadModal.css'

// const now = new Date();
// const lastModified = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'}).format(now)
// const removeSpaces = (s) => s.replace(/\s/g, ''); 

const formatDate = (date) => new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'}).format(date); 

class SaveLoadModal extends Component {
	constructor(props) {
		super(props);
		this.state = {
			formattedDate: formatDate(this.props.date),
		}
	}
	componentDidUpdate(prevProps) {
		const {author, name, date, infoChange} = this.props;
		if (!prevProps.isOpen && this.props.isOpen) {
			const date = new Date();
			infoChange(author, name, date);
			this.setState({formattedDate: formatDate(date)})
		}
	}

	handleNameChange = (e) => {
		const {author, name, date, infoChange} = this.props;
		infoChange(author, e.target.value, date);
	};
	
	handleAuthorChange = (e) => {
		const {author, name, date, infoChange} = this.props;
		infoChange(e.target.value, name, date);
	}
	
	handleSave = () => {
		const {author, name, date, onClose, infoChange} = this.props;
		if (window.MentalModelerConceptMap) {
            window.MentalModelerConceptMap.save();
		}
		onClose();
	}

	render() {
		const {isOpen, mode, onClose, author, name, date, infoChange} = this.props;
		console.log('date:', date);

		return (
			<CSSTransition
				in={isOpen}
				timeout={{
					enter: 500,
					exit: 300
				}}
				classNames="SaveLoadModal"
				mountOnEnter
				unmountOnExit
			>
				<div className="prompt" key={`prompt-trans-${isOpen ? 'enter' : 'exit'}`}>
					<div className="SaveLoadModal__skrim" />
					<div className="SaveLoadModal">
						<div className="SaveLoadModal__dialog">
							{mode === 'save' && (
								<div className="SaveContent">
									<h2>{'Save File'}</h2>
									<p>{'This file (.emp) will be saved to the default location on your local machine (most likely this will be in your "downloads" folder).'}</p>
									<div className="SaveContent__input-row">
										<div className="SaveContent__input-row-title">{'File Name'}</div>
										<input
											className="SaveContent__input"
											value={name}
											onChange={this.handleNameChange}
											placeholder="Enter file name here"
										/>
									</div>
									<div className="SaveContent__input-row">
										<div className="SaveContent__input-row-title">{'Author'}</div>
										<input
											className="SaveContent__input"
											value={author}
											onChange={this.handleAuthorChange}
											placeholder="Enter your name here"
										/>
									</div>
									<div className="SaveContent__input-row">
										<div className="SaveContent__input-row-title">{'Last modified'}</div>
										<div className="">{this.state.formattedDate}</div>
									</div>
									<div className="SaveContent__control-row">
										<button onClick={onClose} className="SaveContent__control-button"><span>{'Cancel'}</span></button>
										<button onClick={this.handleSave} className="SaveContent__control-button"><span>{'Save'}</span></button>
									</div>
								</div>
							)}
							{mode === 'load'
							}
						</div>
					</div>
				</div>
			</CSSTransition>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
    return {
        infoChange: (author, name, date) => {
            dispatch(infoChange(author, name, date))
        }
    };
}

const mapStateToProps = (state) => {
    const {info} = state;
    let {author = '', name = '', date} = info;
    console.log('SaveLoadModal > info:',info)
    return {
        name,
        author,
        date: date ?
            new Date(date)
            : new Date()
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SaveLoadModal);

// export default function SaveLoadModal({isOpen, mode, author = 'sdf', name = 'qwer', description, saveCallback, cancelCallback}) {
// 	const now = new Date();
// 	const lastModified = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'}).format(now)
// 	const reducer = (state, newState) => ({...state, ...newState});
// 	const [state, setState] = useReducer(reducer, {
// 		isOpen: true,
// 		tempName: name,
// 		tempAuthor: author,
// 	});
// 	const removeSpaces = (s) => s.replace(/\s/g, ''); 
// 	const handleNameChange = (e) => setState({tempName: e.target.value});
// 	const handleAuthorChange = (e) => setState({tempAuthor: e.target.value});
// 	const handleSave = () => {
// 		saveCallback({
// 			author: state.tempAuthor,
// 			name: state.tempName,
// 			date: now.toString(),
// 		});
// 	}
// 	console.log('SaveLoadModal, name:', name, 'state.tempName:', state.tempName);
// 	return (
// 		<CSSTransition
// 			in={isOpen}
// 			timeout={{
// 				enter: 500,
// 				exit: 300
// 			}}
// 			classNames="SaveLoadModal"
// 			mountOnEnter
// 			unmountOnExit
// 		>
// 			<div className="prompt" key={`prompt-trans-${state.isOpen ? 'enter' : 'exit'}`}>
// 				<div className="SaveLoadModal__skrim" />
// 				<div className="SaveLoadModal">
// 					<div className="SaveLoadModal__dialog">
// 						{mode === 'save' && (
// 							<div className="SaveContent">
// 								<h2>{'Save File'}</h2>
// 								{/* <div>{'Please enter an author and description for this file.'}<br/>{'* This is optional'}</div> */}
// 								<div className="SaveContent__input-row">
// 									<div className="SaveContent__input-row-title">{'Name'}</div>
// 									<input
// 										className="SaveContent__input"
// 										value={state.tempName}
// 										onChange={handleNameChange}
// 										placeholder="Enter file name here"
// 									/>
// 								</div>
// 								<div className="SaveContent__input-row">
// 									<div className="SaveContent__input-row-title">{'Author'}</div>
// 									<input
// 										className="SaveContent__input"
// 										value={state.tempAuthor}
// 										onChange={handleAuthorChange}
// 										placeholder="Enter your name here"
// 									/>
// 								</div>
// 								<div className="SaveContent__input-row">
// 									<div className="SaveContent__input-row-title">{'Last modified'}</div>
// 									<div className="">{lastModified}</div>
// 								</div>
// 								<div className="SaveContent__control-row">
// 									<button onClick={cancelCallback} className="SaveContent__control-button"><span>{'Cancel'}</span></button>
// 									<button onClick={handleSave} className="SaveContent__control-button"><span>{'Save'}</span></button>
// 								</div>
// 							</div>
// 						)}
// 						{mode === 'load'
// 						}
// 					</div>
// 				</div>
// 			</div>
// 		</CSSTransition>
// 	);
// }
