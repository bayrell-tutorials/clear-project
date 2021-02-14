"use strict;"
if (typeof App == 'undefined') App = {};
if (typeof App.Page == 'undefined') App.Page = {};
App.Page.MainPage = function()
{
	Runtime.Web.Component.apply(this, arguments);
};
App.Page.MainPage.prototype = Object.create(Runtime.Web.Component.prototype);
App.Page.MainPage.prototype.constructor = App.Page.MainPage;
Object.assign(App.Page.MainPage.prototype,
{
	getClassName: function()
	{
		return "App.Page.MainPage";
	},
});
Object.assign(App.Page.MainPage, Runtime.Web.Component);
Object.assign(App.Page.MainPage,
{
	/**
 * Route Action
 * @return RenderContainer
 */
	MainPage: async function(container)
	{
		/* Set title */
		container = Runtime.rtl.setAttr(container, Runtime.Collection.from(["layout", "title"]), "Index page");
		container = Runtime.rtl.setAttr(container, Runtime.Collection.from(["layout", "layout_name"]), "default");
		/* Set page */
		container = container.setPage("App.Page.MainPage", new Runtime.Dict(Runtime.Dict.from({})));
		return Promise.resolve(Runtime.Collection.from([container]));
	},
	render: function(layout, model, params, content)
	{
		return (__control) =>
		{
			
			/* Element 'div' */
			var __v0 = __control.e("element", "div")
				.r();
			
			/* Text */
			__v0.e("text")
				.c("Main page")
				.r();
			__v0.p();
			
		};
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "App.Page";
	},
	getCurrentClassName: function()
	{
		return "App.Page.MainPage";
	},
	getParentClassName: function()
	{
		return "Runtime.Web.Component";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
			"MainPage",
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		if (field_name == "MainPage")
		{
			var Collection = Runtime.Collection;
			var Dict = Runtime.Dict;
			return Dict.from({
				"annotations": Collection.from([
					new Runtime.Web.App.Route(Runtime.Dict.from({"uri":"/","name":"app.main"})),
				]),
			});
		}
		return null;
	},
});
Runtime.rtl.defClass(App.Page.MainPage);
window["App.Page.MainPage"] = App.Page.MainPage;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = App.Page.MainPage;
"use strict;"
if (typeof App == 'undefined') App = {};
App.DefaultLayout = function()
{
	Runtime.Web.Component.apply(this, arguments);
};
App.DefaultLayout.prototype = Object.create(Runtime.Web.Component.prototype);
App.DefaultLayout.prototype.constructor = App.DefaultLayout;
Object.assign(App.DefaultLayout.prototype,
{
	getClassName: function()
	{
		return "App.DefaultLayout";
	},
});
Object.assign(App.DefaultLayout, Runtime.Web.Component);
Object.assign(App.DefaultLayout,
{
	css: function(vars)
	{
	},
	render: function(layout, model, params, content)
	{
		return (__control) =>
		{
			
			var class_name = model.page_class;
			
			if (!Runtime.rtl.isEmpty(class_name))
			{
				/* Component '{class_name}' */
				__control.e("component", class_name)
					.a({"@bind":["App.DefaultLayout",Runtime.Collection.from(["model",class_name])],"@key":"view"})
					.r();
			}
			
		};
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "App";
	},
	getCurrentClassName: function()
	{
		return "App.DefaultLayout";
	},
	getParentClassName: function()
	{
		return "Runtime.Web.Component";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(App.DefaultLayout);
window["App.DefaultLayout"] = App.DefaultLayout;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = App.DefaultLayout;
"use strict;"
if (typeof App == 'undefined') App = {};
App.Frontend = function()
{
	Runtime.Web.App.WebApp.apply(this, arguments);
};
App.Frontend.prototype = Object.create(Runtime.Web.App.WebApp.prototype);
App.Frontend.prototype.constructor = App.Frontend;
Object.assign(App.Frontend.prototype,
{
	/**
	 * Start driver
	 */
	startDriver: async function()
	{
		await Runtime.Web.App.WebApp.prototype.startDriver.bind(this)();
	},
	getClassName: function()
	{
		return "App.Frontend";
	},
});
Object.assign(App.Frontend, Runtime.Web.App.WebApp);
Object.assign(App.Frontend,
{
	/**
	 * Extends entities
	 */
	extendEntities: function(c, entities)
	{
		return entities;
	},
	/**
	 * Init app
	 */
	appInit: function(c)
	{
		return c.constructor.appInit(c);
	},
	/**
	 * Start app
	 */
	appStart: async function(c)
	{
		return Promise.resolve(await c.constructor.appStart(c));
	},
	/**
	 * Web App Run
	 */
	appRun: async function()
	{
		await Runtime.Web.App.WebApp.appRun.bind(this)();
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "App";
	},
	getCurrentClassName: function()
	{
		return "App.Frontend";
	},
	getParentClassName: function()
	{
		return "Runtime.Web.App.WebApp";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
				new Runtime.LambdaChainClass(Runtime.Dict.from({})),
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(App.Frontend);
window["App.Frontend"] = App.Frontend;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = App.Frontend;
"use strict;"
if (typeof App == 'undefined') App = {};
App.Page404 = function()
{
	Runtime.Web.Component.apply(this, arguments);
};
App.Page404.prototype = Object.create(Runtime.Web.Component.prototype);
App.Page404.prototype.constructor = App.Page404;
Object.assign(App.Page404.prototype,
{
	getClassName: function()
	{
		return "App.Page404";
	},
});
Object.assign(App.Page404, Runtime.Web.Component);
Object.assign(App.Page404,
{
	render: function(layout, model, params, content)
	{
		return (__control) =>
		{
			
			/* Text */
			__control.e("text")
				.c(Runtime.rtl.getContext().translate("App", "Page not found"))
				.r();
			;
			
		};
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "App";
	},
	getCurrentClassName: function()
	{
		return "App.Page404";
	},
	getParentClassName: function()
	{
		return "Runtime.Web.Component";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(App.Page404);
window["App.Page404"] = App.Page404;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = App.Page404;
"use strict;"
if (typeof App == 'undefined') App = {};
App.Routes = function()
{
};
Object.assign(App.Routes.prototype,
{
	getClassName: function()
	{
		return "App.Routes";
	},
});
Object.assign(App.Routes,
{
	/**
	 * Extends components
	 */
	componentsChain: function(components)
	{
		return Runtime.Collection.from([components]);
	},
	/**
	 * Title chain
	 */
	titleChain: function(layout, title)
	{
		title = title + Runtime.rtl.toStr(" | App");
		return Runtime.Collection.from([layout,title]);
	},
	/**
	 * Render chain
	 * Page not found
	 * @return RenderContainer
	 */
	renderChain_Page404: async function(container)
	{
		if (container == null || container.isResponseExists() || container.isPageExists())
		{
			return Promise.resolve(Runtime.Collection.from([container]));
		}
		/* Set title */
		container = Runtime.rtl.setAttr(container, Runtime.Collection.from(["layout", "title"]), "Page not found");
		container = Runtime.rtl.setAttr(container, Runtime.Collection.from(["layout", "layout_name"]), "default");
		/* Set page */
		container = container.setPage("App.Page404", null);
		/* Set 404 code */
		container = Runtime.rtl.setAttr(container, Runtime.Collection.from(["new_http_code"]), 404);
		return Promise.resolve(Runtime.Collection.from([container]));
	},
	/**
	 * Render chain. Set layout
	 */
	renderChain_Layout: function(container)
	{
		if (container.layout.layout_name == "default")
		{
			container = Runtime.rtl.setAttr(container, Runtime.Collection.from(["layout", "layout_class"]), "App.DefaultLayout");
		}
		if (container.layout.layout_name == "admin")
		{
			container = Runtime.rtl.setAttr(container, Runtime.Collection.from(["layout", "layout_class"]), "App.DefaultLayout");
		}
		if (container.layout.layout_class == "")
		{
			container = Runtime.rtl.setAttr(container, Runtime.Collection.from(["layout", "layout_class"]), "App.DefaultLayout");
		}
		return Runtime.Collection.from([container]);
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "App";
	},
	getCurrentClassName: function()
	{
		return "App.Routes";
	},
	getParentClassName: function()
	{
		return "";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
				new Runtime.Web.App.RouteList(Runtime.Dict.from({})),
				new Runtime.LambdaChainClass(Runtime.Dict.from({})),
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
			"componentsChain",
			"titleChain",
			"renderChain_Page404",
			"renderChain_Layout",
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		if (field_name == "componentsChain")
		{
			var Collection = Runtime.Collection;
			var Dict = Runtime.Dict;
			return Dict.from({
				"annotations": Collection.from([
					new Runtime.LambdaChain(Runtime.Dict.from({"name":Runtime.Web.RenderDriver.COMPONENTS_CHAIN})),
				]),
			});
		}
		if (field_name == "titleChain")
		{
			var Collection = Runtime.Collection;
			var Dict = Runtime.Dict;
			return Dict.from({
				"annotations": Collection.from([
					new Runtime.LambdaChain(Runtime.Dict.from({"name":Runtime.Web.App.WebApp.TITLE_CHAIN})),
				]),
			});
		}
		if (field_name == "renderChain_Page404")
		{
			var Collection = Runtime.Collection;
			var Dict = Runtime.Dict;
			return Dict.from({
				"annotations": Collection.from([
					new Runtime.LambdaChain(Runtime.Dict.from({"name":Runtime.Web.App.WebApp.RENDER_CHAIN,"pos":Runtime.Web.App.WebApp.RENDER_CHAIN_CALL_PAGE_NOT_FOUND,"is_async":true})),
				]),
			});
		}
		if (field_name == "renderChain_Layout")
		{
			var Collection = Runtime.Collection;
			var Dict = Runtime.Dict;
			return Dict.from({
				"annotations": Collection.from([
					new Runtime.LambdaChain(Runtime.Dict.from({"name":Runtime.Web.App.WebApp.RENDER_CHAIN,"pos":Runtime.Web.App.WebApp.RENDER_CHAIN_LAYOUT + 10})),
				]),
			});
		}
		return null;
	},
});
Runtime.rtl.defClass(App.Routes);
window["App.Routes"] = App.Routes;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = App.Routes;
"use strict;"
if (typeof App == 'undefined') App = {};
App.ModuleDescription = function()
{
};
Object.assign(App.ModuleDescription.prototype,
{
	getClassName: function()
	{
		return "App.ModuleDescription";
	},
});
Object.assign(App.ModuleDescription,
{
	/**
	 * Returns module name
	 * @return string
 	 */
	getModuleName: function()
	{
		return "App";
	},
	/**
	 * Returns module name
	 * @return string
	 */
	getModuleVersion: function()
	{
		return "0.0.1";
	},
	/**
	 * Returns required modules
	 * @return Dict<string>
	 */
	requiredModules: function()
	{
		return Runtime.Dict.from({"Runtime":">=0.3","Runtime.Web.App":"*"});
	},
	/**
	 * Returns enities
	 */
	entities: function()
	{
		return Runtime.Collection.from([new Runtime.Entity(Runtime.Dict.from({"name":"App.Routes"})),new Runtime.Web.App.RouteList(Runtime.Dict.from({"name":"App.Page.MainPage"})),new Runtime.Entity(Runtime.Dict.from({"name":"App.Frontend"})),new Runtime.Driver(Runtime.Dict.from({"name":"WebApp","value":"App.Frontend","global":true,"params":Runtime.Dict.from({})}))]);
	},
	/**
	 * Returns context settings
	 * @return Dict<string>
	 */
	appSettings: function(env)
	{
		return Runtime.Dict.from({"config":Runtime.Dict.from({"Runtime.Web":Runtime.Dict.from({"f_inc":(Runtime.rtl.getContext().env("APP_MODE", "prod") == "prod") ? (2) : (Runtime.rtl.utime())})})});
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "App";
	},
	getCurrentClassName: function()
	{
		return "App.ModuleDescription";
	},
	getParentClassName: function()
	{
		return "";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(App.ModuleDescription);
window["App.ModuleDescription"] = App.ModuleDescription;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = App.ModuleDescription;