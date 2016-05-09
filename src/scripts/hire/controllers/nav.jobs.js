angular.module('qui.hire')
  .controller('NavJobsController', [
    'Jobs',
    '$state',
    function NavJobsCtrl(Jobs, $state) {
      const vm = this;
      vm.jobHref = function jobHref(jobId) {
        const states = ['app.jobs.manage', 'app.jobs.view', 'app.jobs.edit'];
        const name = ~states.indexOf($state.current.name) ? $state.current.name : states[0];
        return $state.href(name, { jobId });
      };

      vm.jobs = []; // collection of jobs
      vm.ui = { lazyLoad: true, loading: false }; // ui states
      vm.params = { start: 0, rows: 15, fl: 'id,role,job_status,owner_id' }; // GET query params
      vm.loadJobs = function loadJobs() {
        if (!vm.ui.lazyLoad) return; // if no more jobs to get
        vm.ui = { lazyLoad: false, loading: true };

        Jobs
          .get(vm.params)
          .then(result => {
            // if no jobs uploaded ever redirect to welcome
            if (!(vm.params.start || result.length)) return $state.go('app.welcome');
            angular.forEach(result, job => {
              vm.jobs.push(job);
            });

            // data has been loaded
            vm.ui.loading = false;

            // check for returned results count and set lazy loadLoad false if less
            vm.ui.lazyLoad = angular.equals(result.length, vm.params.rows);

            // increment offset for next loading of results
            vm.params.start = vm.params.start + vm.params.rows;

            return vm.loadJobs();
          });
      };

      vm.loadJobs();
    },
  ]);
