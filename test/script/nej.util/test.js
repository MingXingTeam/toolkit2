var should = require('should'),
    ut = require('util'),
    fs = require('../../../lib/util/file.js'),
    util = require('../../../lib/script/nej/util.js');

describe('script/nej/util',function(){

    describe('.parsePlatform(platform)',function(){
        [
            {
                platform:'td',
                result:{engines:['trident']}
            },
            {
                platform:'td-0',
                result:{engines:['trident'],lower:'3.0'}
            },
            {
                platform:'td-1',
                result:{engines:['trident'],lower:'6.0'}
            },
            {
                platform:'wk',
                result:{engines:['webkit']}
            },
            {
                platform:'gk',
                result:{engines:['gecko']}
            },
            {
                platform:'android',
                result:{engines:['webkit']}
            },
            {
                platform:'ios',
                result:{engines:['webkit']}
            },
            {
                platform:'cef',
                result:{engines:['webkit']}
            },
            {
                platform:'win',
                result:{engines:['trident'],lower:'6.0'}
            },
            {
                platform:'td|wk|gk',
                result:{engines:['trident','webkit','gecko']}
            },
            {
                platform:'wk|gk',
                result:{engines:['webkit','gecko']}
            }
        ].forEach(function(config){
            it('should return '+JSON.stringify(config.result)+' for platform '+config.platform,function(){
                var ret = util.parsePlatform(config.platform);
                config.result.should.be.eql(ret);
            });
        });
    });

    describe('.parseExpression(expression)',function(){
        [
            {
                exp:'TR',
                result:{engine:"trident"}
            },
            {
                exp:'WR',
                result:{engine:"webkit"}
            },
            {
                exp:'GR',
                result:{engine:"gecko"}
            },
            {
                exp:'TV',
                result:{engine:"trident"}
            },
            {
                exp:'WV',
                result:{engine:"webkit"}
            },
            {
                exp:'GV',
                result:{engine:"gecko"}
            },
            {
                exp:'TR>3.0',
                result:{engine:"trident",version:'release',lower:{value:'3.0',eq:false}}
            },
            {
                exp:'TR<3.0',
                result:{engine:"trident",version:'release',upper:{value:'3.0',eq:false}}
            },
            {
                exp:'TR<=3.0',
                result:{engine:"trident",version:'release',upper:{value:'3.0',eq:true}}
            },
            {
                exp:'TR=3.0',
                result:{engine:"trident",version:'release',midle:{value:'3.0',eq:true}}
            },
            {
                exp:'3.0<TR',
                result:{engine:"trident",version:'release',lower:{value:'3.0',eq:false}}
            },
            {
                exp:'3.0>TR',
                result:{engine:"trident",version:'release',upper:{value:'3.0',eq:false}}
            },
            {
                exp:'3.0>=TR',
                result:{engine:"trident",version:'release',upper:{value:'3.0',eq:true}}
            },
            {
                exp:'3.0=TR',
                result:{engine:"trident",version:'release',midle:{value:'3.0',eq:true}}
            },
            {
                exp:'2.0<TR<3.0',
                result:{engine:"trident",version:'release',lower:{value:'2.0',eq:false},upper:{value:'3.0',eq:false}}
            },
            {
                exp:'2.0<=TR<=3.0',
                result:{engine:"trident",version:'release',lower:{value:'2.0',eq:true},upper:{value:'3.0',eq:true}}
            },
            {
                exp:'3.0>=TR>=2.0',
                result:{engine:"trident",version:'release',lower:{value:'2.0',eq:true},upper:{value:'3.0',eq:true}}
            },
            {
                exp:'3.0>=TR=2.0',
                result:{engine:"trident",version:'release',midle:{value:'2.0',eq:true},upper:{value:'3.0',eq:true}}
            }
        ].forEach(function(config){
            it('should return '+JSON.stringify(config.result)+' for expression '+config.exp,function(){
                var ret = util.parseExpression(config.exp);
                config.result.should.be.eql(ret);
            });
        });
    });

    describe('.isExpFitPlatform(exp,platform)',function(){
        [
            {
                exp:'TR>3.0',
                platform:'td',
                result:true
            },
            {
                exp:'TR<3.0',
                platform:'td-0',
                result:false
            },
            {
                exp:'TR=3.0',
                platform:'td-0',
                result:true
            },
            {
                exp:'TR<6.0',
                platform:'td-1',
                result:false
            },
            {
                exp:'TR=6.0',
                platform:'td-1',
                result:true
            },
            {
                exp:'GR',
                platform:'td',
                result:false
            },
            {
                exp:'GR',
                platform:'td|gk|wk',
                result:true
            },
            {
                exp:'2.0<TR<=3.0',
                platform:'td-0',
                result:true
            },
            {
                exp:'2.0<TR<3.0',
                platform:'td-0',
                result:false
            }
        ].forEach(function(config){
            it('should '+(!config.result?'not ':'')+'match platform '+config.platform+' with expression '+config.exp,function(){
                var ret = util.isExpFitPlatform(config.exp,config.platform);
                (ret===config.result).should.be.true;
            });
        });
    });

    describe('.exp2condition(name,exp)',function(){
        [
            {
                exp:'TR',
                result:"p._$KERNEL.engine==='trident'"
            },
            {
                exp:'TR=2.0a',
                result:"p._$KERNEL.engine==='trident'&&p._$KERNEL.release=='2.0a'"
            },
            {
                exp:'TR>2.0',
                result:"p._$KERNEL.engine==='trident'&&p._$KERNEL.release>'2.0'"
            },
            {
                exp:'TR<2.0',
                result:"p._$KERNEL.engine==='trident'&&p._$KERNEL.release<'2.0'"
            },
            {
                exp:'TR>=2.0',
                result:"p._$KERNEL.engine==='trident'&&p._$KERNEL.release>='2.0'"
            },
            {
                exp:'TR<=2.0',
                result:"p._$KERNEL.engine==='trident'&&p._$KERNEL.release<='2.0'"
            },
            {
                exp:'6.0>TR>=2.0',
                result:"p._$KERNEL.engine==='trident'&&p._$KERNEL.release>='2.0'&&p._$KERNEL.release<'6.0'"
            }
        ].forEach(function(config){
            it('should return '+config.result+' for expresion '+config.exp,function(){
                var ret = util.exp2condition('p',config.exp);
                config.result.should.be.equal(ret);
            });
        });
    });

    describe('.parseURI(uri,config)',function(){
        [
            {
                uri:'c:/path/to/a.js',
                config:null,
                result:{uri:'c:/path/to/a.js'}
            },
            {
                uri:'http://a.b.com/path/to/a.js',
                config:null,
                result:{uri:'http://a.b.com/path/to/a.js'}
            },
            {
                uri:'base/element',
                config:{libRoot:'c:/nej/src/'},
                result:{uri:'c:/nej/src/base/element.js'}
            },
            {
                uri:'pro/util/extend',
                config:{params:{pro:'c:/pro/'}},
                result:{uri:'c:/pro/util/extend.js'}
            },
            {
                uri:'/path/to/file.js',
                config:{webRoot:'c:/webapp/'},
                result:{uri:'c:/webapp/path/to/file.js'}
            },
            {
                uri:'{platform}element.js',
                config:{pathRoot:'c:/nej/src/base/'},
                result:{uri:'c:/nej/src/base/platform/element.js',patch:'c:/nej/src/base/platform/element.patch.js'}
            },
            {
                uri:'text!/path/to/file.css',
                config:{webRoot:'c:/webapp/'},
                result:{uri:'c:/webapp/path/to/file.css',plugin:'text'}
            }
        ].forEach(function(config){
            it('should return '+JSON.stringify(config.result)+' for uri '+config.uri+' with config '+JSON.stringify(config.config),function(){
                var ret = util.parseURI(config.uri,config.config);
                config.result.should.be.eql(ret);
            });
        });
    });

    describe('.deps2injector(list)',function(){
        [
            {
                list:[{uri:'/a/b/c.js'},{uri:'/d/e.js'}],
                result:[1,2]
            },
            {
                list:[{uri:'/a/b/c.js'},{uri:'/a/b/c.js'}],
                result:[1,1]
            },
            {
                list:[{uri:'/a/b/c.js',plugin:'json'},{uri:'/a/b/c.js'}],
                result:[3,1]
            }
        ].forEach(function(config){
            it('should return '+JSON.stringify(config.result)+' for list '+JSON.stringify(config.list),function(){
                var ret = util.deps2injector(config.list);
                config.result.should.be.eql(ret);
            });
        });
    });

    describe('.formatArgs(uri,deps,func)',function(){
        [
            {
                args:['/a/b.js',['/a/c.js','/d/e.js'],function(){}],
                result:['/a/b.js',['/a/c.js','/d/e.js'],function(){}]
            },
            {
                args:['/a/b.js',['/a/c.js','/d/e.js']],
                result:['/a/b.js',['/a/c.js','/d/e.js'],null]
            },
            {
                args:['/a/b.js'],
                result:['/a/b.js',null,null]
            },
            {
                args:[],
                result:[null,null,null]
            },
            {
                args:[['/a/c.js','/d/e.js'],function(){}],
                result:[null,['/a/c.js','/d/e.js'],function(){}]
            },
            {
                args:[function(){}],
                result:[null,null,function(){}]
            }
        ].forEach(function(config){
            it('should return '+JSON.stringify(config.result)+' for '+JSON.stringify(config.args),function(){
                var ret = util.formatArgs.apply(util,config.args);
                config.result.should.eql(ret);
            });
        });
    });

    describe('.parseConfig(uri,config)',function(){
        [
            {
                uri:'http://fed.hz.netease.com/nej2/src/define.js?pro=/src/javascript/&p=wk',
                config:{webRoot:'c:/webapp/'},
                result:{nejPlatform:'wk',libRoot:'http://fed.hz.netease.com/nej2/src/',params:{pro:'c:/webapp/src/javascript/',lib:'http://fed.hz.netease.com/nej2/src/'}}
            },
            {
                uri:'/src/javascript/nej/define.js?p=td|wk|gk',
                config:{webRoot:'c:/webapp/',pathRoot:'c:/webapp/html/'},
                result:{nejPlatform:'td|wk|gk',libRoot:'c:/webapp/src/javascript/nej/',params:{pro:'c:/webapp/src/javascript/',lib:'c:/webapp/src/javascript/nej/'}}
            },
            {
                uri:'/src/javascript/nej/define.js?d=./deps.js',
                config:{webRoot:'c:/webapp/',pathRoot:__dirname+'/'},
                result:{libRoot:'c:/webapp/src/javascript/nej/',params:{pro:'c:/webapp/src/javascript/',lib:'c:/webapp/src/javascript/nej/'},deps:{
                    'pro/a.js':['pro/b.js','pro/c.js'],
                    'pro/b.js':['pro/e.js','pro/f.js','pro/a/c/d.js'],
                    'pro/c.js':['pro/f.js'],
                    'pro/f.js':['pro/f.js','pro/a/c/d.js']
                }}
            }
        ].forEach(function(config){
            it('should return '+JSON.stringify(config.result)+' for uri '+config.uri+' with config '+JSON.stringify(config.config),function(){
                var ret = util.parseConfig(config.uri,config.config);
                config.result.should.be.eql(ret);
            });
        });
    });

    describe('.parseFileContent(content)',function(){
        [
            {
                file:'a.js',
                result:null
            },
            {
                file:'b.js',
                result:['base/element','util/ajax/xdr','pro/widget/ui']
            },
            {
                file:'c.js',
                result:{dependency:['base/element','util/ajax/xdr','pro/widget/ui'],source:''}
            }
        ].forEach(function(config){
            it('should return '+JSON.stringify(config.result)+' for file '+config.file,function(){
                var ret = util.parseFileContent(
                    fs.read(__dirname+'/'+config.file).join('\n')
                );
                if (config.result==null){
                    (ret==null).should.be.true;
                }else if(ut.isArray(config.result)){
                    config.result.should.be.eql(ret.dependency);
                }else{
                    config.result.should.be.eql(ret);
                }
            });
        });
    });

});