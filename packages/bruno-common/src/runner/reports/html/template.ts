import type { T_RunnerRequestExecutionResult } from '../../types';

export const getFilteredRequestResults = (results: T_RunnerRequestExecutionResult[] = [], onlyFailed = false) => {
  const indexedResults = (Array.isArray(results) ? results : []).map((value, index) => ({ value, index }));

  if (!onlyFailed) {
    return indexedResults;
  }

  return indexedResults.filter(
    ({ value }) =>
      value?.status === 'error'
      || !!value?.testResults?.find((t) => t.status !== 'pass')
      || !!value?.assertionResults?.find((t) => t.status !== 'pass')
  );
};

export const htmlTemplateString = (resutsJsonString: string) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <!-- Would use latest version, you'd better specify a version -->
    <script src="https://unpkg.com/naive-ui"></script>

    <title>Bruno</title>
    <style>
      .error > .status {
        color: red;
      }
      .success > .status {
        color: green;
      }

      .n-collapse-item.success > .n-collapse-item__header {
        background-color: rgba(237, 247, 242, 1);
      }
      .n-collapse-item.error > .n-collapse-item__header {
        background-color: rgba(251, 238, 241, 1);
      }
      .skipped > .status {
        color: orange;
      }

      .min-width-150 {
        min-width: 150px;
      }

      /* Metadata card styling - minimal custom styles */
      .metadata-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 8px;
        margin-top: 12px;
      }

      .metadata-item {
        text-align: center;
        padding: 6px 8px;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
      }

      .metadata-label {
        font-size: 0.65rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
        opacity: 0.7;
      }

      .metadata-value {
        font-size: 0.8rem;
        font-weight: normal;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }
    </style>
  </head>
  <body>
    <div id="app">
      <n-config-provider :theme="theme">
        <n-layout embedded position="absolute" content-style="padding: 24px;">
          <n-card>
            <n-flex>
              <n-page-header title="Bruno run dashboard">
                <template #avatar>
                  <n-avatar size="large" style="background-color: transparent">
                    <img src="data:image/png;base64,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" width="34" height="34" alt="Brunommerce">
                  </n-avatar>
                </template>
                <template #extra>
                  <n-flex justify="end">
                    <n-switch v-model:value="darkMode" :rail-style="darkModeRailStyle">
                      <template #checked> Dark </template>
                      <template #unchecked> Light </template>
                    </n-switch>
                  </n-flex>
                </template>
              </n-page-header>
              <n-tabs type="segment" animated v-model:value="currentTab">
                <n-tab-pane name="summary" tab="Summary">
                  <n-flex justify="center" vertical>
                    <!-- Run Information Card using Naive UI components -->
                    <n-card title="Run Information" size="small">
                      <div class="metadata-grid">
                        <n-card class="metadata-item" size="small">
                          <div class="metadata-label">Date & Time</div>
                          <div class="metadata-value">{{ runCompletionTime }}</div>
                        </n-card>
                        <n-card class="metadata-item" size="small">
                          <div class="metadata-label">Version</div>
                          <div class="metadata-value">{{ brunoVersion }}</div>
                        </n-card>
                        <n-card class="metadata-item" size="small">
                          <div class="metadata-label">Environment</div>
                          <div class="metadata-value">{{ environment }}</div>
                        </n-card>
                        <n-card class="metadata-item" size="small">
                          <div class="metadata-label">Total run duration</div>
                          <div class="metadata-value">{{ totalDuration }}</div>
                        </n-card>
                        <n-card class="metadata-item" size="small">
                          <div class="metadata-label">Total data received</div>
                          <div class="metadata-value">{{ totalDataReceived }}</div>
                        </n-card>
                        <n-card class="metadata-item" size="small">
                          <div class="metadata-label">Average response time</div>
                          <div class="metadata-value">{{ averageResponseTime }}</div>
                        </n-card>
                      </div>
                    </n-card>
                    <x-summary v-for="(result, index) in res" :res="result" :key="index"></x-summary>
                  </n-flex>
                </n-tab-pane>
                <n-tab-pane name="requests" tab="Requests">
                  <n-flex justify="center" vertical>
                    <x-requests v-for="(result, index) in res" :res="result" :key="index"></x-requests>
                  </n-flex>
                </n-tab-pane>
              </n-tabs>
            </n-flex>
          </n-card>
        </n-layout>
      </n-config-provider>
    </div>
    <script type="text/x-template" id="summary-component">
      <n-flex vertical style="margin-bottom: 50px;">
        <n-card>
          <template #header>
            <span style="font-size: 24px;">{{ iterationTitle }}</span>
          </template>
          <n-flex justify="center">
            <n-flex justify="center">
              <n-alert type="success">
                <n-statistic
                  label="Total requests"
                  :value="summaryTotalRequests"
                >
                </n-statistic>
              </n-alert>
              <n-alert :type="summaryErrors ? 'error' : 'success'">
                <n-statistic label="Total errors" :value="summaryErrors">
                </n-statistic>
              </n-alert>
              <n-alert type="success">
                <n-statistic
                  label="Total Controls"
                  :value="summaryTotalControls"
                >
                </n-statistic>
              </n-alert>
              <n-alert :type="summaryFailedControls ? 'error' : 'success'">
                <n-statistic
                  label="Total Failed Controls"
                  :value="summaryFailedControls"
                >
                </n-statistic>
              </n-alert>
              <n-alert type="warning" v-if="summarySkippedRequests">
                <n-statistic label="Skipped requests" :value="summarySkippedRequests">
                </n-statistic>
              </n-alert>
            </n-flex>
          </n-flex>
        </n-card>
        <n-data-table :columns="summaryColumns" :data="summaryData" />
      </n-flex>
    </script>
    <script type="text/x-template" id="requests-component">
      <n-card>
        <template #header>
          <span style="font-size: 24px;">{{ iterationTitle }}</span>
        </template>
        <n-flex vertical style="margin-bottom: 50px">
          <n-switch
            v-model:value="onlyFailed"
            :rail-style="railStyle"
          >
            <template #checked> Only Failed </template>
            <template #unchecked> Show All </template>
          </n-switch>

          <n-collapse>
            <x-result v-for="result in results" :result="result.value" :index="result.index" :key="result.index"></x-result>
          </n-collapse>
        </n-flex>
      </n-card>
    </script>
    <script type="text/x-template" id="result-component">
      <n-collapse-item
        :name="resultTitle"
        arrow-placement="right"
      >
        <template #header>
          <n-alert
            :type="getAlertType"
            :bordered="false"
          >
            <template #header>
              {{result.path}} - {{resultSummary}} {{hasError && result.response.status !== 'skipped' ? " - (request failed)" : "" }}
            </template>
          </n-alert>
        </template>
        <n-flex vertical>
          <n-grid x-gap="12" :cols="2">
            <n-gi>
              <n-card title="REQUEST INFORMATION">
                <n-list>
                  <n-list-item>
                    <n-thing
                      title="File"
                      :description="result.path"
                    />
                  </n-list-item>
                  <n-list-item>
                    <n-thing
                      title="Request Method"
                      :description="result.request.method"
                    />
                  </n-list-item>
                  <n-list-item>
                    <n-thing
                      title="Request URL"
                      :description="result.request.url"
                    />
                  </n-list-item>
                </n-list>
              </n-card>
            </n-gi>
            <n-gi>
              <n-card title="RESPONSE INFORMATION">
                <n-list>
                  <n-list-item>
                    <n-thing
                      title="Response Code"
                      :description="responseCode"
                    />
                  </n-list-item>
                  <n-list-item>
                    <n-thing
                      title="Response time"
                      :description="result.response.responseTime + ' ms'"
                    />
                  </n-list-item>
                  <n-list-item>
                    <n-thing
                      title="Test duration"
                      :description="testDuration"
                    />
                  </n-list-item>
                </n-list>
              </n-card>
            </n-gi>
          </n-grid>
          <n-alert v-if="hasError || (result.response.status === 'skipped' && result.error)" title="Error" type="error">
            {{result.error}}
          </n-alert>
          <n-card title="REQUEST HEADERS">
            <n-data-table
              :columns="headerColumns"
              :data="headerDataRequest"
            />
          </n-card>
          <n-card
            v-if="result.request.data"
            title="REQUEST BODY"
          >
          <iframe
            v-if="result.request.isHtml"
            :srcdoc="result.request.data"
            style="width: 100%; height: 400px; border: none;"
          ></iframe>

          <pre v-else>{{ result.request.data }}</pre>
          </n-card>
          <n-card title="RESPONSE HEADERS">
            <n-data-table
              :columns="headerColumns"
              :data="headerDataResponse"
            />
          </n-card>
          <n-card
            v-if="result.response.data"
            title="RESPONSE BODY"
          >
          <iframe
            v-if="result.response.isHtml"
            :srcdoc="result.response.data"
            style="width: 100%; height: 400px; border: none;"
          ></iframe>

          <pre v-else>{{ result.response.data }}</pre>          </n-card>
          <n-card title="ASSERTIONS INFORMATION">
            <n-data-table
              :columns="assertionsColumns"
              :data="result.assertionResults"
              :row-class-name="assertionsRowClassName"
            />
          </n-card>
          <n-card title="TESTS INFORMATION">
            <n-data-table
              :columns="testsColumns"
              :data="result.testResults"
              :row-class-name="testsRowClassName"
            />
          </n-card>
        </n-flex>
      </n-collapse-item>
    </script>
    <script>
      const { createApp, ref, computed, onMounted } = Vue;

      const getFilteredRequestResults = ${getFilteredRequestResults.toString()};

      function mergeTests(runnerResults) {
        if (!Array.isArray(runnerResults)) return runnerResults; 

        runnerResults.forEach(iteration => {
          const { totalTests, passedTests, failedTests, totalPreRequestTests, passedPreRequestTests, failedPreRequestTests, totalPostResponseTests, passedPostResponseTests, failedPostResponseTests } = iteration.summary;
          
          // Merge summary test counts
          iteration.summary.totalTests = totalTests + totalPreRequestTests + totalPostResponseTests;
          iteration.summary.passedTests = passedTests + passedPreRequestTests + passedPostResponseTests;
          iteration.summary.failedTests = failedTests + failedPreRequestTests + failedPostResponseTests;
          
          // Merge individual result test arrays
          iteration.results.forEach(result => {
            result.testResults = [
              ...(result.preRequestTestResults || []),
              ...(result.postResponseTestResults || []),
              ...(result.testResults || [])
            ];
          }); 
        });
        
        return runnerResults;
      }

      const App = {
        setup() {
          function decodeBase64(base64) {
            const binary = atob(base64);
            const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
            return new TextDecoder().decode(bytes);
          }
          const rawResults = JSON.parse(decodeBase64('${resutsJsonString}'));

          const res = computed(() => {
            return mergeTests(rawResults.results);
          });

          const brunoVersion = computed(() => {
            return rawResults.version || '-';
          });

          const environment = computed(() => {
            return rawResults.environment || '-';
          });

          const runCompletionTime = computed(() => {
            if (rawResults.runCompletionTime) {
              return new Date(rawResults.runCompletionTime).toLocaleString();
            }
            return '-';
          });

          const currentTab = ref('summary');

          const getTabFromQueryParam = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const tab = urlParams.get('tab');
            return tab && ['summary', 'requests'].includes(tab) ? tab : 'summary';
          };

          onMounted(() => {
            currentTab.value = getTabFromQueryParam();
          });

          const darkMode = ref(false);
          const theme = computed(() => {
            return darkMode.value ? naive.darkTheme : null;
          });

          const totalDuration = computed(() => {
            const total = res.value.reduce((totalTime, iteration) => {
              return totalTime + iteration.results.reduce((sum, result) => sum + (result.runDuration || 0), 0);
            }, 0);
            return total > 0 ? Math.round(total * 1000) / 1000 + 's' : '-';
          });

          const totalDataReceived = computed(() => {
            const bytes = res.value.reduce((total, iteration) => {
              return total + iteration.results.reduce((sum, result) => {
                const responseData = result.response?.data;
                if (typeof responseData === 'string') {
                  return sum + new Blob([responseData]).size;
                }
                return sum + (JSON.stringify(responseData || {}).length || 0);
              }, 0);
            }, 0);
            
            if (bytes === 0) return '-';
            if (bytes < 1024) return bytes + 'B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + 'KB';
            return (bytes / (1024 * 1024)).toFixed(2) + 'MB';
          });

          const averageResponseTime = computed(() => {
            let totalTime = 0;
            let count = 0;
            
            res.value.forEach(iteration => {
              iteration.results.forEach(result => {
                if (result.response?.responseTime) {
                  totalTime += result.response.responseTime;
                  count++;
                }
              });
            });
            
            return count > 0 ? Math.round(totalTime / count) + 'ms' : '-';
          });

          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            darkMode.value = true;
          }
          // To watch for os theme changes
          window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
            darkMode.value = event.matches;
          });
          return {
            res,
            theme,
            darkMode,
            darkModeRailStyle: () => ({ background: 'var(--n-rail-color)' }),
            currentTab,
            brunoVersion,
            environment,
            totalDuration,
            totalDataReceived,
            averageResponseTime,
            runCompletionTime
          };
        }
      };
      const app = Vue.createApp(App);

      app.component('x-summary', {
        template: '#summary-component',
        props: ['res'],
        setup(props) {
          const summaryColumns = [
            {
              title: 'SUMMARY ITEM',
              key: 'title'
            },
            {
              title: 'TOTAL',
              key: 'total'
            },
            {
              title: 'PASSED',
              key: 'passed'
            },
            {
              title: 'FAILED',
              key: 'failed'
            },
            {
              title: 'SKIPPED',
              key: 'skipped'
            },
            {
              title: 'ERROR',
              key: 'error'
            }
          ];
          const summaryData = computed(() => [
            {
              title: 'Requests',
              total: props.res.summary.totalRequests,
              passed: props.res.summary.passedRequests,
              failed: props.res.summary.failedRequests,
              skipped: props.res.summary.skippedRequests,
              error: props.res.summary.errorRequests
            },
            {
              title: 'Assertions',
              total: props.res.summary.totalAssertions,
              passed: props.res.summary.passedAssertions,
              failed: props.res.summary.failedAssertions,
              skipped: '-',
              error: '-'
            },
            {
              title: 'Tests',
              total: props.res.summary.totalTests,
              passed: props.res.summary.passedTests,
              failed: props.res.summary.failedTests,
              skipped: '-',
              error: '-'
            }
          ]);
          const summaryTotalRequests = computed(() => {
            return props.res.summary.totalRequests;
          });
          const summaryTotalControls = computed(() => {
            return props.res.summary.totalTests + props.res.summary.totalAssertions;
          });
          const summaryFailedControls = computed(
            () => props.res.summary.failedTests + props.res.summary.failedAssertions
          );
          const summarySkippedRequests = computed(() => props?.res?.summary?.skippedRequests || 0);
          const summaryErrors = computed(() => props?.res?.results?.filter((r) => r.error || r.status === 'error').length) || 0;
          const totalRunDuration = computed(() => props.res?.results?.reduce((total, result) => result.runDuration + total, 0));
          const iterationIndex = Number(props.res.iterationIndex) + 1;
          return {
            summaryColumns,
            summaryData,
            summaryTotalControls,
            summaryTotalRequests,
            summaryFailedControls,
            summarySkippedRequests,
            summaryErrors,
            totalRunDuration,
            iterationTitle: 'Iteration ' + iterationIndex
          };
        }
      });

      app.component('x-requests', {
        template: '#requests-component',
        props: ['res'],
        setup(props) {
          const onlyFailed = ref(false);
          const filteredResults = computed(() => {
            return getFilteredRequestResults(props?.res?.results, onlyFailed.value);
          });
          const iterationIndex = Number(props.res.iterationIndex) + 1;
          return {
            onlyFailed,
            results: filteredResults,
            railStyle: ({ checked }) => {
              const style = {};
              if (checked) {
                style.background = '#d03050';
              }
              return style;
            },
            iterationTitle: 'Iteration ' + iterationIndex
          };
        }
      });

      app.component('x-result', {
        template: '#result-component',
        props: ['result', 'index'],
        setup(props) {
          const headerColumns = [
            {
              title: 'Header Name',
              key: 'name',
              className: 'min-width-150'
            },
            {
              title: 'Header Value',
              key: 'value'
            }
          ];
          const assertionsColumns = [
            {
              title: 'Expression',
              key: 'lhsExpr'
            },
            {
              title: 'Operator',
              key: 'operator'
            },
            {
              title: 'Operand',
              key: 'rhsOperand'
            },
            {
              title: 'Status',
              key: 'status',
              className: 'status'
            },
            {
              title: 'Error',
              key: 'error'
            }
          ];
          const assertionsRowClassName = (row) => {
            return row.status === 'fail' ? 'error' : 'success';
          };
          const testsRowClassName = (row) => {
            if (row.status === 'skipped') return 'skipped';
            return row.status === 'fail' ? 'error' : 'success';
          };
          const testsColumns = [
            {
              title: 'Description',
              key: 'description'
            },
            {
              title: 'Status',
              key: 'status',
              className: 'status'
            },
            {
              title: 'Error',
              key: 'error'
            }
          ];

          function mapHeaderToTableData(headers) {
            if (!headers) {
              return [];
            }
            return Object.keys(headers).map((name) => ({
              name,
              value: headers[name]
            }));
          }
          const headerDataRequest = computed(() => {
            return mapHeaderToTableData(props?.result?.request?.headers);
          });
          const headerDataResponse = computed(() => {
            return mapHeaderToTableData(props?.result?.response?.headers);
          });
          const totalPassed = computed(() => {
            return (
              (props?.result?.testResults?.filter((t) => t.status === 'pass').length || 0) +
              (props?.result?.assertionResults?.filter((t) => t.status === 'pass').length || 0)
            );
          });
          const total = computed(() => {
            return (props?.result?.testResults?.length || 0) + (props?.result?.assertionResults?.length || 0);
          });

          const hasError = computed(() => !!props?.result?.error || props?.result?.status === 'error' || (props?.result?.response?.status === 'skipped' && props?.result?.error));
          const hasFailure = computed(() => total.value !== totalPassed.value);
          const testDuration = computed(() => Math.round(props?.result?.runDuration * 1000) + ' ms');
          const resultTitle = computed(() => props?.result?.path + ' ' + props?.result?.response?.status + ' ' + props?.result?.response?.statusText + ' ' + props?.index);
          const responseCode = computed(() => {
            if (props.result.response.status === 'skipped') {
              return '-';
            }
            return '' + props.result.response.status;
          });
          const resultSummary = computed(() => {
            if (props.result.response.status === 'skipped') {
              return props.result.skipReason === 'bail' ? 'Request skipped due to bail' : 'Request Skipped';
            }
            return totalPassed.value + '/' + total.value + ' Passed';
          });
          const getAlertType = computed(() => {
            if (props.result.response.status === 'skipped') {
              return 'warning';
            }
            return hasError.value || hasFailure.value ? 'error' : 'success';
          });
          return {
            headerColumns,
            headerDataRequest,
            headerDataResponse,
            assertionsColumns,
            assertionsRowClassName,
            testsRowClassName,
            totalPassed,
            total,
            hasFailure,
            hasError,
            testsColumns,
            result: props.result,
            testDuration,
            responseCode,
            resultTitle,
            resultSummary,
            getAlertType,
            iterationIndex: props?.result?.iterationIndex
          };
        }
      });

      app.use(naive);
      app.mount('#app');
    </script>
  </body>
</html>
`;

export default htmlTemplateString;
