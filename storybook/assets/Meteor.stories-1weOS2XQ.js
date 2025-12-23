import{a as o,P as s,M as n}from"./HelloWorld-DB_KtPT2.js";import"./index-l3GKPc2F.js";import"./iframe-BwRNlEhr.js";import"./preload-helper-Dp1pzeXC.js";import"./client-mdm2ZO4L.js";const u={title:"Scenes/Meteor",component:n,parameters:{layout:"fullscreen"},decorators:[s],argTypes:{pathType:{control:"select",options:o,description:"Path type for the meteor animation"},startRatio:{control:{type:"range",min:1,max:2,step:.1},description:"Start position ratio"},shrinkDuration:{control:{type:"range",min:.5,max:5,step:.5},description:"Duration of shrink animation in seconds"},baseBlur:{control:{type:"range",min:0,max:10,step:1},description:"Base blur amount"},layers:{control:{type:"range",min:5,max:20,step:1},description:"Number of layers"}}},t={args:{pathType:"rect",startRatio:1.1,shrinkDuration:2,baseBlur:3,layers:10}};var e,r,a;t.parameters={...t.parameters,docs:{...(e=t.parameters)==null?void 0:e.docs,source:{originalSource:`{
  args: {
    pathType: "rect",
    startRatio: 1.1,
    shrinkDuration: 2,
    baseBlur: 3,
    layers: 10
  }
}`,...(a=(r=t.parameters)==null?void 0:r.docs)==null?void 0:a.source}}};const y=["Default"];export{t as Default,y as __namedExportsOrder,u as default};
