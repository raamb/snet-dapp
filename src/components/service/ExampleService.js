import React from 'react';
import {hasOwnDefinedProperty} from '../../util'

export default class ExampleService extends React.Component {

    constructor(props) {
        super(props);
        this.submitAction = this.submitAction.bind(this);
        this.handleServiceName = this.handleServiceName.bind(this);
        this.handleFormUpdate = this.handleFormUpdate.bind(this);
        this.getServiceMethods = this.getServiceMethods.bind(this);

        this.state = {
            serviceName: "Calculator",
            methodName: "Select a method",
            a: 0,
            b: 0
        };

        this.isComplete = false;
        this.serviceMethods = [];
        this.allServices = [];
        this.methodsForAllServices = [];
        this.parseProps(props);
    }

    componentWillReceiveProps(nextProps) {
        if(this.isComplete !== nextProps.isComplete) {
            this.parseProps(nextProps);
        }
    }

    parseProps(nextProps) {
        this.isComplete = nextProps.isComplete;
        if (!this.isComplete) {
            this.parseServiceSpec(nextProps.serviceSpec);
        }
    }

    parseServiceSpec(serviceSpec) {
        const packageName = Object.keys(serviceSpec.nested).find(key =>
            typeof serviceSpec.nested[key] === "object" &&
            hasOwnDefinedProperty(serviceSpec.nested[key], "nested"));

        var objects = undefined;
        var items = undefined;
        if (typeof packageName !== 'undefined') {
            items = serviceSpec.lookup(packageName);
            objects = Object.keys(items);
        } else {
            items = serviceSpec.nested;
            objects = Object.keys(serviceSpec.nested);
        }

        this.methodsForAllServices = [];
        objects.map(rr => {
            if (typeof items[rr] === 'object' && items[rr] !== null && items[rr].hasOwnProperty("methods")) {
                this.allServices.push(rr);
                this.methodsForAllServices.push(rr);

                var methods = Object.keys(items[rr]["methods"]);
                this.methodsForAllServices[rr] = methods;
            }
        });
        this.getServiceMethods(this.allServices[0]);
    }

    getServiceMethods(strService) {
        this.setState({
            serviceName: strService
        });
        var data = this.methodsForAllServices[strService];
        if (typeof data === 'undefined') {
            data = [];
        }
        this.serviceMethods = data;
    }

    canBeInvoked() {
        return (this.state.methodName !== "Select a method");
    }

    handleFormUpdate(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    handleServiceName(event) {
        let strService = event.target.value;
        this.setState({
            serviceName: strService
        });
        this.serviceMethods.length = 0;
        if (typeof strService !== 'undefined' && strService !== 'Select a service') {
            let data = Object.values(this.methodsForAllServices[strService]);
            if (typeof data !== 'undefined') {
                this.serviceMethods= data;
            }
        }
    }

    onKeyPressvalidator(event) {
        const keyCode = event.keyCode || event.which;
        if (!(keyCode == 8 || keyCode == 46) && (keyCode < 48 || keyCode > 57)) {
            event.preventDefault()
        } else {
            let dots = event.target.value.split('.');
            if (dots.length > 1 && keyCode == 46)
                event.preventDefault()
        }
    }

    submitAction() {
        this.props.callApiCallback(this.state.serviceName,
            this.state.methodName, {
                a: this.state.a,
                b: this.state.b
            });
    }

  renderServiceMethodNames(serviceMethodNames) {
    const serviceNameOptions = ["Select a method", ...serviceMethodNames];
    return serviceNameOptions.map((serviceMethodName, index) => {
      return <option key={index}>{serviceMethodName}</option>;
    });
  }

  renderForm() {
    const service = this.props.protoSpec.findServiceByName(this.state.serviceName);
    const serviceMethodNames = service.methodNames;
    return (
      <React.Fragment>
        <div className="row">
          <div className="col-md-3 col-lg-3" style={{ padding: "10px", fontSize: "13px", marginLeft: "10px" }}>
            Method Name:
          </div>
          <div className="col-md-3 col-lg-3">
            <select
              name="methodName"
              style={{ height: "30px", width: "250px", fontSize: "13px", marginBottom: "5px" }}
              onChange={this.handleFormUpdate}
            >
              {this.renderServiceMethodNames(serviceMethodNames)}
            </select>
          </div>
        </div>

        <div className="row">
          <div className="col-md-3 col-lg-3" style={{ padding: "10px", fontSize: "13px", marginLeft: "10px" }}>
            Number 1:
          </div>
          <div className="col-md-3 col-lg-3">
            <input
              name="a"
              type="number"
              style={{ height: "30px", width: "250px", fontSize: "13px", marginBottom: "5px" }}
              value={this.state.a}
              onChange={this.handleFormUpdate}
              onKeyPress={(e) => this.onKeyPressvalidator(e)}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-3 col-lg-3" style={{ padding: "10px", fontSize: "13px", marginLeft: "10px" }}>
            Number 2:
          </div>
          <div className="col-md-3 col-lg-3">
            <input
              name="b"
              type="number"
              style={{ height: "30px", width: "250px", fontSize: "13px", marginBottom: "5px" }}
              value={this.state.b}
              onChange={this.handleFormUpdate}
              onKeyPress={(e) => this.onKeyPressvalidator(e)}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 col-lg-6" style={{ textAlign: "right" }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.submitAction}
              disabled={!this.canBeInvoked()}
            >
              Invoke
            </button>
          </div>
        </div>
      </React.Fragment>
    )
  }

  parseResponse() {
    const { response }= this.props;

    if(typeof response !== 'undefined') {
      if(typeof response === 'string') {
        return response;
      }

      return response.value;
    }
  }

  renderComplete() {
    const response = this.parseResponse();

    return <div><p style={{ fontSize: "13px" }}>Response from service is {response}</p></div>;
  }

    render() {
        if (this.isComplete)
            return (
                <div>
                    {this.renderComplete()}
                </div>
            );
        else {
            return (
                <div>
                    {this.renderForm()}
                </div>
            )
        }
    }
}
