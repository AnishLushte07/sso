class ClientSignupController {
  /* @ngInject */
  constructor($http, $stateParams, $timeout, urls, $location) {
    this.$http = $http;
    this.$stateParams = $stateParams;
    this.$timeout = $timeout;
    this.urls = urls;
    this.$location = $location;
  }

  $onInit() {
    this.ui = { loading: false, success: false, error: false };
    this.type = this.$stateParams.type;
    this.src = (this.$stateParams && this.$stateParams.src)
      ? this.$stateParams.src
      : 1;
    this.resetData();
    this.EmployeeRange = [
      { name: '1', value: '1' },
      { name: '2-10', value: '2-10' },
      { name: '11-50', value: '11-50' },
      { name: '51-200', value: '51-200' },
      { name: '201-500', value: '201-500' },
      { name: '501-1000', value: '501-1000' },
      { name: '1001-5000', value: '1001-5000' },
      { name: '5001-10000', value: '5001-10000' },
      { name: '10000+', value: '10001-100000' },
    ];
    this.url = this.$location.search();
  }

  getEmployer(search) {
    return this.$http
      .get(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${search}`, {
        ignoreAuthModule: true,
      })
      .then(({ data }) => data.map(x => x.name));
  }

  resetData() {
    this.data = {
      signup_source_id: this.src,
      allocate: {
        mgr_id: atob(this.$stateParams.userId),
        type: this.type,
      },
    };
  }

  message(type = '', err = {}) {
    this.ui[type] = (type === 'success')
      ? 'Your request has been submitted. We will contact you shortly'
      : (err.msg || 'An error occured please contact QuezX.com');
    if (type === 'success') return this.resetData();
    this.$timeout(() => (this.ui[type] = ''), 5000);
    return (this.ui.loading = false);
  }

  create(form) {
    this.ui.loading = true;
    const { firstname, lastname, email, mobno, companyname } = this.data;
    const obj = this.type === 1
      ? { name: `${firstname} ${lastname}` }
      : {
        fullname: `${firstname} ${lastname}`,
        email,
        contact_no: mobno,
        company_name: companyname,
      };
    Object.assign(obj, this.url);
    Object.assign(this.data, obj);
    this.$http
    .post(`${this.urls.SSO_APP}/api/signUps`, this.data, {
      ignoreAuthModule: true,
    })
    .then(() => {
      form.$setPristine();
      this.message('success');
    })
    .catch(({ data }) => this.message('error', data));
  }
}

export default ClientSignupController;
