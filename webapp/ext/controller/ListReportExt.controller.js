sap.ui.define([
    //"sap/ui/core/mvc/ControllerExtension",
    "sap/ui/model/Filter",
    "sap/m/MessageToast"
],

    function (Filter, MessageToast) { 
        'use strict';

        var that;

        return {//ControllerExtension.extend("br.com.eldoradobrasil.fi050.fi050.ext.controller.ListReportExt", {
            //override: {
            onInit: function () {
                sap.ui.getCore().getConfiguration().getFormatSettings().setDatePattern("short", "dd-MM-YYYY");
            },

            DownloadComprovantes: function (oEvent, aSelectedContexts) {

                sap.ui.core.BusyIndicator.show();

                //Buscar Index da tabela
                var chave = "";
                let selected = this.extensionAPI.getSelectedContexts();
                var entities = "";
                if (selected.length === 0) {
                    sap.ui.core.BusyIndicator.hide()
                    var message = that.getView().getModel("i18n").getResourceBundle().getText("msg03");
                    MessageToast.show(message);
                    return;
                }
                for (let index = 0; index < selected.length; index++) {
                    const element = selected[index];
                    if (entities !== "") {
                        entities += ",";
                    }
                    //entities += element.oModel.getData(element.sPath).entityname;
                    chave = chave.concat(element.getProperty("Belnr"), element.getProperty("Bukrs"), element.getProperty("Gjahr"));
                }

                //Buscar Documento - Exemplo = "170000096710002016"
                that = this;
                var oModel = this.getOwnerComponent().getModel();
                this.getView().setModel(oModel, "oModel");

                var selectedLine = oEvent.getSource().getParent().getParent().getSelectedItems();

                var oFilter = new sap.ui.model.Filter({
                    path: "Iddoc",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: chave
                });

                oModel.read("/AnexosSet", {
                    filters: [oFilter],
                    success: function (oData, response) {
                        var results = new sap.ui.model.json.JSONModel({
                            "Result": oData.results
                        });

                        if (oData.results.length == 0) {
                            var message = that.getView().getModel("i18n").getResourceBundle().getText("msg01");
                            MessageToast.show(message);
                        }

                        that.getView().setModel(results, "AnexosList");
                        sap.ui.core.BusyIndicator.hide();
                    },

                    error: function (error) {
                        sap.ui.core.BusyIndicator.hide()
                    }

                });

                this.pDialog ??= this.loadFragment({
                    name: "br.com.eldoradobrasil.fi050.fi050.fragments.Comprovantes"
                });
                this.pDialog.then((oDialog) => oDialog.open());

            },

            onDownload: function (oEvent) {
                var oItem = oEvent.getSource();
                var chaveText = oItem.getProperty("description");
                const myArrayChave = chaveText.split("/");

                var oModel = this.getOwnerComponent().getModel();

                //AnexosSet(Iddoc='170000096710002016',LoObjid='005056A45BFE1EDEA395D300571FA0E9')/$value
                var callService = "";
                callService = callService.concat(oModel.sServiceUrl, "/AnexosSet(Iddoc='", myArrayChave[0], "',LoObjid='", myArrayChave[1], "')/$value");
                window.open(callService);
                var message = that.getView().getModel("i18n").getResourceBundle().getText("msg02");
                MessageToast.show(message);
            },

            onCloseDialog() {
                // note: We don't need to chain to the pDialog promise, since this event handler
                // is only called from within the loaded dialog itself.
                this.byId("DownloadComprovantesDialog").close();
            },


            onInitSmartFilterBarExtension: function (oEvent) {
                var userInfo;
                userInfo = sap.ushell.Container.getService("UserInfo").getEmail();
            
                if(userInfo == null){
                    userInfo = "felipe.goes@accao.com.br";
                }

                //Get SmartFilterBar 
                var oGlobalFilter = oEvent.getSource();

                //Create JSON data that contains the Inital value of the filter
                var oToday = new Date();
                var lowValue = new Date(oToday.setMonth(oToday.getMonth() - 3)); //subtract 3 month
                var oToday = new Date();

                //"created_on" is the name of the filter field. You should put your own field ID.
                var oDefaultFilter = {
                    "Dtvencimento": {
                        "ranges": [{
                            "exclude": false,
                            "operation": "BT",
                            "keyField": "Dtvencimento",
                            "value1": lowValue,
                            "value2": oToday
                        }]
                    },
                    "PortalUser": {
                        "ranges": [{
                            "exclude": false,
                            "operation": "EQ",
                            "keyField": "PortalUser",
                            "value1": userInfo,
                            "value2": ""
                        }]
                    }
                };

                //Set SmartFilterBar initial values
                oGlobalFilter.setFilterData(oDefaultFilter);

                //In case you want to hide a Filter
                oGlobalFilter.determineFilterItemByName("Dtvencimento").setVisibleInFilterBar(true);
                oGlobalFilter.determineFilterItemByName("Status").setVisibleInFilterBar(true);
                oGlobalFilter.determineFilterItemByName("PortalUser").setVisibleInFilterBar(false);

            },

            onBeforeRebindTableExtension: function (oEvent) {
                var message = this.getView().getModel("i18n").getResourceBundle().getText("footerText");
                var oMessage = {
                    message: message,
                    type: sap.ui.core.MessageType.Warning
                };

                this.extensionAPI.setCustomMessage(oMessage);

                /*
                var oID = oEvent.getSource().getId();;
                var smartTable = oEvent.getSource();
                var oTable = smartTable.getTable();
                var userInfo = sap.ushell.Container.getService("UserInfo").getEmail();;
 
                //Read $fiter params to pass selected value in custom filter
                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.parameters = oBindingParams.parameters || {};
                oBindingParams.filters.push(new sap.ui.model.Filter("PortalUser", "EQ", "felipe.goes@accao.com.br"));              
                **/
            }
            //}
        };//);
    });