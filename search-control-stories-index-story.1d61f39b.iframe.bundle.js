"use strict";(self.webpackChunkgutenberg=self.webpackChunkgutenberg||[]).push([[1864],{"./packages/components/src/search-control/stories/index.story.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,default:()=>__WEBPACK_DEFAULT_EXPORT__});var _wordpress_element__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/react/index.js"),___WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./packages/components/src/search-control/index.tsx"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/jsx-runtime.js");const __WEBPACK_DEFAULT_EXPORT__={title:"Components/Selection & Input/Common/SearchControl",id:"components-searchcontrol",component:___WEBPACK_IMPORTED_MODULE_1__.A,argTypes:{onChange:{action:"onChange"},value:{control:!1}},parameters:{sourceLink:"packages/components/src/search-control",badges:[],controls:{expanded:!0},docs:{canvas:{sourceState:"shown"}}}},Template=({onChange,...props})=>{const[value,setValue]=(0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)();return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(___WEBPACK_IMPORTED_MODULE_1__.A,{...props,value,onChange:(...changeArgs)=>{setValue(...changeArgs),onChange(...changeArgs)}})};Template.displayName="Template";const Default=Template.bind({});Default.args={help:"Help text to explain the input.",__nextHasNoMarginBottom:!0},Default.parameters={...Default.parameters,docs:{...Default.parameters?.docs,source:{originalSource:"({\n  onChange,\n  ...props\n}) => {\n  const [value, setValue] = useState<string>();\n  return <SearchControl {...props} value={value} onChange={(...changeArgs) => {\n    setValue(...changeArgs);\n    onChange(...changeArgs);\n  }} />;\n}",...Default.parameters?.docs?.source}}}}}]);