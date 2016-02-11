angular.module('qui.hire')
  .controller('JobsController', [
    'Jobs',
    'Page',
    function JobsCtrl(Jobs, Page) {
      const vm = this;
      Page.setTitle('Posted Jobs');
      vm.jobs = []; // collection of jobs
      vm.ui = { lazyLoad: true, loading: false }; // ui states
      vm.params = { start: 0, rows: 15 }; // GET query params
      vm.loadJobs = function loadJobs() {
        if (!vm.ui.lazyLoad) return; // if no more jobs to get
        vm.ui = { lazyLoad: false, loading: true };
        Jobs.get(vm.params).then(function jobList(result) {
          angular.forEach(result, function iterateJobs(job) {
            vm.jobs.push(job);
          });

          // data has been loaded
          vm.ui.loading = false;

          // check for returned results count and set lazy loadLoad false if less
          vm.ui.lazyLoad = angular.equals(result.length, vm.params.rows) ? true : false;

          // increment offset for next loading of results
          vm.params.start = vm.params.start + vm.params.rows;
        });
      };

      vm.loadJobs();
    },
  ]);
