angular.module('qui')
  .controller('JobCommentsController', [
    'JobComments',
    '$stateParams',
    'User',
    function JobCommentsCtrl(JobComments, $stateParams, User) {
      const vm = this;
      vm.loadJobComments = function loadJobComments() {
        vm.ui = { loading: true, scrollToBottom: false };
        JobComments
          .get($stateParams.jobId)
          .then(function gotJobComment(result) {
            vm.data = result;

            // data has been loaded
            vm.ui = { loading: false, scrollToBottom: true };
          });
      };

      vm.insert = function insertComment() {
        const comment = vm.post.comment;
        vm.ui = { loading: true, scrollToBottom: false };
        JobComments
          .set($stateParams.jobId, { comment: comment })
          .then(function insertedComment() {
            vm.post.comment = '';
            vm.data.push({
              user: { name: User.userinfo.name },
              body: comment,
              created_at: new Date().toISOString(),
            });

            // data has been loaded
            vm.ui = { loading: false, scrollToBottom: true };
          });
      };

      vm.loadJobComments();
    },
  ]);
