import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import html2canvas from 'html2canvas';
import 'core-js';

// import registerServiceWorker from './registerServiceWorker'; 
import allReducers from './reducers';
import App from './App';
import util from './utils/util';
import {mmpXMLToJSON} from './utils/xml2json';
import {modelLoad} from './actions/index';

import fire from './data/fire.mmp.json'; // eslint-disable-line
import simple from './data/simple.mmp.json'; // eslint-disable-line
import test_emp from './data/test.emp.json'; // eslint-disable-line

import './index.css';

const params = new URLSearchParams(document.location.search.substring(1));
let store = createStore(allReducers, {});

function loadModel(state) {
    // console.log('MentalModelerConceptMap > loadModel\nstate:', state, '\n\n');
    store.dispatch(modelLoad(state));
}

function load(result) {
    let data = result;
    try {
        if (typeof data === 'string') {
            data = result.indexOf('<?xml') > -1
                ? mmpXMLToJSON(result)
                : JSON.parse(result)
            data = util.initData(data);
            // clearTimeout(loadTimeoutId);
            // loadTimeoutId = setTimeout(() => {
            //     loadTimeoutId = undefined;
            //     loadModel(data);
            // }, 0);
            // loadModel({});
            loadModel({});
            loadModel(data);
        } else {
            console.log('result:', result);
            alert('ERROR - file loaded is not a string\nfile: '.concat(result.toString()));
        }
    } catch (e) {
        alert('ERROR - load failed\n'.concat(e));
    }
}

function save() {
    const data =  util.exportData(store.getState());
    const info = data.js.info;
    const {author, name} = info;
    // console.log('\n\n---- MentalModelerConceptMap > save\ndata.js:', data.js, '\n\n');
    util.writeLocalFile({
        content: data.json,
        name: `${name || '[name]'} - ${author || '[author]'}.emp`,
        type: 'json'
    });
}

function render(target = '#root') {
    try {
        let elem;
        if (target instanceof Element || target instanceof HTMLDocument) {
            elem = target;
        } else if (typeof target === 'string') {
            elem = document.querySelector(target);
        }
        ReactDOM.render(
            <Provider store={store}>
                <App />
            </Provider>,
            elem
        );
    } catch (e) {
        console.error('ERROR - ConceptMap > render, e:', e);
    }
}

// screenshot api call that returns canvas element of map from html2canvas
function screenshot () {
    if (typeof window.html2canvas === 'undefined') {
        console.error('ERROR: html2canvas is not defined (screenshot)');
        return
    }

    const mapContent = document.querySelector('.map__content');
    if (mapContent) {
        const width = mapContent.scrollWidth;
        const height = mapContent.scrollHeight; 
        const svgs = mapContent.querySelectorAll('svg');
        svgs.forEach((svg) => {
            svg.setAttributeNS(null, 'width', width);
            svg.setAttributeNS(null, 'height', height);
        });
        mapContent.style.overflow = 'visible';

        const promise = (window.html2canvas(mapContent, {width, height, allowTaint: true, logging: false}));

        promise.then((canvas) => {
            try {
                svgs.forEach((svg) => {
                    svg.removeAttributeNS(null, 'width');
                    svg.removeAttributeNS(null, 'height');
                });
                mapContent.style.overflow = 'auto';
            } catch (e) {
                console.log(e);
            }
        });

        return promise;
    }
}

render();
// load(JSON.stringify(test_emp));

// Define public API
let publicApi = {
    render,
    load,
    save,
    screenshot
};

// registerServiceWorker();
// console.log('store.getState():', store.getState());

// Expose to global scope
if (typeof window !== 'undefined') {
    window.html2canvas = html2canvas;
    window.MentalModelerConceptMap = publicApi;
}

// document.body.addEventListener('click', () => {
//     console.log('screenshot:', screenshot());
// });
