import _ from 'lodash';
import Convert from 'ansi-to-html';
import initialState from './initialState';
import { reducer as fetchProjectData } from './fetchProjectData';
import { reducer as fetchFileContent } from './fetchFileContent';
import { reducer as showDemoAlertReducer } from './showDemoAlert';
import { reducer as hideDemoAlertReducer } from './hideDemoAlert';
import { reducer as saveFileReducer } from './saveFile';
import { reducer as closeTabReducer } from './closeTab';
import { reducer as moveTabReducer } from './moveTab';
import { reducer as codeChangeReducer } from './codeChange';
import { reducer as stickTabReducer } from './stickTab';
import { storage } from '../../common/utils';
import { reducer as updateProjectDataReducer } from './updateProjectData';
import { reducer as showDialogReducer } from './showDialog';
import { reducer as hideDialogReducer } from './hideDialog';
import { reducer as setViewChangedReducer } from './setViewChanged';
import { reducer as setBottomDrawerVisibleReducer } from './setBottomDrawerVisible';
import { reducer as clearOutputReducer } from './clearOutput';
import { reducer as setBottomDrawerTabReducer } from './setBottomDrawerTab';
import { reducer as setTempTabReducer } from './setTempTab';
import { reducer as removePathsReducer } from './removePaths';
import { reducer as npmListReducer } from './npmList';
import { reducer as fetchFilesReducer } from './fetchFiles';
import { reducer as includeFileReducer } from './includeFile';
import { reducer as removeFileContentReducer } from './removeFileContent';

const convert = new Convert();

const reducers = [
  fetchProjectData,
  fetchFileContent,
  showDemoAlertReducer,
  hideDemoAlertReducer,
  saveFileReducer,
  closeTabReducer,
  moveTabReducer,
  codeChangeReducer,
  stickTabReducer,
  updateProjectDataReducer,
  showDialogReducer,
  hideDialogReducer,
  setViewChangedReducer,
  setBottomDrawerVisibleReducer,
  clearOutputReducer,
  setBottomDrawerTabReducer,
  clearOutputReducer,
  setTempTabReducer,
  removePathsReducer,
  npmListReducer,
  fetchFilesReducer,
  includeFileReducer,
  removeFileContentReducer,
];

// const pascalCase = _.flow(
//   _.camelCase,
//   _.upperFirst
// );

export default function reducer(state = initialState, action) {
  let newState;
  switch (action.type) {
    // Put global reducers here
    case 'PROJECT_DATA_CHANGED':
      // case 'CORE_EXEC_CORE_COMMAND_SUCCESS': // For quick project reoload.
      newState = {
        ...state,
        projectDataNeedReload: true,
      };
      break;

    case '@@router/LOCATION_CHANGE': {
      const pathname = action.payload.location.pathname || '/';
      // const { tempPath } = state;
      // let newTempPath = tempPath;
      const openPaths = state.openPaths.slice(0);
      const historyPaths = state.historyPaths.slice(0);
      if (!_.includes(openPaths, pathname)) {
        // if (tempPath) {
        //   _.pull(openPaths, tempPath);
        // }
        openPaths.push(pathname);
        // newTempPath = pathname;
      }
      _.pull(historyPaths, pathname);
      historyPaths.unshift(pathname);
      storage.session.setItem('openPaths', openPaths);
      storage.session.setItem('historyPaths', historyPaths);
      
      newState = { ...state, openPaths, historyPaths /*tempPath: newTempPath*/ };
      break;
      // Open tab or switch tab type while url changes.
      // if (!state.elementById) {
      //   newState = state;
      //   break;
      // }
      // let tab;
      // plugin
      //   .getPlugins('tab.getTab')
      //   .reverse()
      //   .some(p => {
      //     const t = p.tab.getTab(pathname, state);
      //     if (!t) return false;
      //     tab = { ...p.tab.getTab(pathname, state) };
      //     return true;
      //   });
      // let { openTabs, historyTabs } = state;

      // if (!tab) {
      //   openTabs = openTabs.map(t => (t.isActive ? { ...t, isActive: false } : t));
      //   newState = { ...state, openTabs };
      //   storage.session.setItem('openTabs', openTabs);
      //   break;
      //   // tab = {
      //   //   name: 'No Tab',
      //   //   key: 'rekit:not-found',
      //   //   icon: 'not-found',
      //   //   iconColor: 'red',
      //   // };
      // }
      // tab.isTemp = !tab.noPreview;

      // openTabs = openTabs.map(t => ({ ...t, isActive: false }));

      // let foundTab = _.find(openTabs, { key: tab.key });
      // if (!foundTab) {
      //   if (tab.isTemp) {
      //     const currentTemp = _.find(openTabs, 'isTemp');
      //     if (currentTemp) {
      //       openTabs = _.filter(openTabs, t => !t.isTemp);
      //       historyTabs = _.without(historyTabs, currentTemp.key);
      //     }
      //   }

      //   tab.urlPath = pathname;
      //   tab.isActive = true;

      //   openTabs = [...openTabs, tab];
      //   foundTab = tab;
      // } else {
      //   foundTab = { ...tab, isTemp: foundTab.isTemp };
      // }

      // // If current url path doesn't match urlPath of element which has sub tabs,
      // // redirect to the default/current url path of the element.
      // if (
      //   foundTab.subTabs &&
      //   foundTab.subTabs.length &&
      //   !foundTab.subTabs.some(t => t.urlPath === pathname)
      // ) {
      //   let redirectUrlPath;
      //   if (foundTab.subTabs.some(t => t.urlPath === foundTab.urlPath))
      //     redirectUrlPath = foundTab.urlPath;
      //   else
      //     redirectUrlPath = (_.find(foundTab.subTabs, 'isDefault') || foundTab.subTabs[0]).urlPath;
      //   requestAnimationFrame(() => history.replace(redirectUrlPath));
      //   newState = state;
      //   break;
      // }

      // const foundIndex = _.findIndex(openTabs, { key: foundTab.key });
      // openTabs = update(openTabs, {
      //   [foundIndex]: { $set: { ...foundTab, urlPath: pathname, isActive: true } },
      // });
      // historyTabs = [tab.key, ..._.without(historyTabs, tab.key)];
      // newState = { ...state, openTabs, historyTabs };
      // storage.session.setItem('openTabs', openTabs);
      // storage.session.setItem('historyTabs', historyTabs);
      // break;
    }

    case 'REKIT_STUDIO_OUTPUT': {
      let output = state.output.slice(0);
      if (Array.isArray(action.data)) {
        output.push.apply(
          output,
          action.data.map(item => ({
            ...item,
            text: convert
              .toHtml(
                item.text
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/ /g, '&nbsp;'),
              )
              .replace('#00A', '#1565C0')
              .replace(/color:#555/g, 'color:#777'),
          })),
        );
      }
      if (output.length > 500) output = output.slice(-500);
      newState = {
        ...state,
        output,
      };
      break;
    }

    case 'TERM_VIEW_OUTPUT':
      newState = {
        ...state,
        termViewOutput: [...state.termViewOutput, ...action.data],
      };
      break;

    default:
      newState = state;
      break;
  }
  return reducers.reduce((s, r) => r(s, action), newState);
}
