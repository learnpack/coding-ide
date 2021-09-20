import React, { createRef } from 'react';
import logo from '../img/breathecode.png';
import Editor from './components/editor/Editor.js';
import Terminal from './components/terminal/Terminal.js';
import SmartInput from './components/smart-input/SmartInput.js';
import Intro from './components/intro/Intro.js';
import StatusBar from './components/status-bar/StatusBar.js';
import Sidebar from './components/sidebar/sidebar.js';
import InternalError from './components/internal-error/internal-error.js';
import SplitPane from 'react-split-pane';
import HelpPanel from './components/help/help.js';
import { confirm, alert, prompt } from './components/alerts/alert';
import { MarkdownParser, Loading } from "@breathecode/ui-components";
import Socket, { isPending, getStatus } from './socket';
import { getHost, loadExercises, loadSingleExercise, loadFile, saveFile, loadReadme } from './actions.js';
import Joyride from 'react-joyride';
import { LearnPackError, deepMerge, getParams } from "./utils";
import { Session } from 'bc-react-session';
import TagManager from 'react-gtm-module';

const actions = [
    { slug: 'build', label: 'Build', icon: 'fas fa-box-open' },
    { slug: 'run', label: 'Compile', icon: 'fas fa-play' },
    { slug: 'preview', label: 'Preview', icon: 'fas fa-play' },
    { slug: 'pretty', label: 'Pretty', icon: 'fas fa-paint-brush' },
    { slug: 'test', label: 'Test', icon: 'fas fa-check' },
    { slug: 'reset', label: 'Reset', icon: 'fas fa-sync', confirm: true, refresh: true }
];

//create your first component
export default class Home extends React.Component{
    constructor(){
        super();
        this.state = {
            host: getHost(),
            helpSteps: {
                standalone: [
                    {
                        target: '.bc-readme',
                        content: <span><h4>1) Read!</h4>Every exercise will come with a brief introduction and some instructions on how to complete it.</span>,
                        placement: 'right',
                        disableBeacon: true
                    },
                    {
                        target: '.react-monaco-editor-container',
                        content: <span><h4>2) Code!</h4>Use this coding editor on the right of the screen to code and propose a solution.</span>,
                        placement: 'left'
                    },
                    {
                        target: '.button-bar',
                        content: <span><h4>3) Compile!</h4>Use the terminal buttons to <code>build</code> and <code>test</code> your exercises solutions.</span>,
                        placement: 'left'
                    },
                    {
                        target: '.bc-terminal .status',
                        content: <span>The console will always display the current state of the code, compilation errors or test results.</span>,
                        placement: 'bottom'
                    },
                    {
                        target: '.next-exercise',
                        content: 'Once you are satisfied with your code solution, you can go ahead to the next exercise.',
                        placement: 'bottom'
                    },
                    // {
                    //     target: 'body',
                    //     content: <span><h4>4) Deliver!</h4>After finishing all exercises run <code>$ bc deliver:exercises</code> on your command line to deliver the exercises into the breathecode platform.</span>,
                    //     placement: 'center'
                    // }
                ],
                preview: [
                    {
                        target: 'body',
                        content: <span><h4>1) Read!</h4>Every exercise will come with a brief introduction and some instructions on how to complete it.</span>,
                        placement: 'center',
                        disableBeacon: true
                    },
                    {
                        target: 'body',
                        placement: 'center',
                        content: <span><h4>2) Code!</h4>Use the coding editor on the left of the screen to code and propose a solution.</span>,
                        disableBeacon: true
                    },
                    {
                        target: '.button-bar',
                        content: <span><h4>3) Compile!</h4>Use the terminal buttons to <code>build</code> and <code>test</code> your exercises solutions.</span>,
                        placement: 'bottom'
                    },
                    {
                        target: '.status',
                        content: <span>The console will always display the current state of the code, compilation errors or test results.</span>,
                        placement: 'bottom'
                    },
                    {
                        target: '.next-exercise',
                        content: 'Once you are satisfied with your code solution, you can go ahead to the next exercise.',
                        placement: 'bottom'
                    },
                    // {
                    //     target: 'body',
                    //     content: <span><h4>4) Deliver!</h4>After finishing all exercises run <code>$ bc deliver:exercises</code> on your command line to deliver the exercises into the breathecode platform.</span>,
                    //     placement: 'center'
                    // }
                ]
            },
            openHelpPanel: false,
            editorSocket: null,
            menuOpened: false,
            editorSize: 450,
            config: null,
            codeHasBeenChanged: true,
            exercises: [],
            error: null,
            files: [],
            compilerSocket: null,
            consoleLogs: [],
            consoleStatus: null,
            isSaving: false,
            
            current: null,
            currentInstructions: null,
            currentFileContent: null,
            currentTranslation: 'us',
            currentFileTranslations: ['us'],
            currentFileName: null,
            currentFileExtension: null,
            possibleActions: [],
            configObject: null,

            tutorial: null,
            intro: null,
            introOpen: true,

            getIndex: (slug) => {
                for(let i=0; i<this.state.exercises.length; i++)
                    if(this.state.exercises[i].slug == slug) return i;

                return false;
            },
            next: () => {
                if(this.state.introOpen && this.state.intro) return null;

                const i = this.state.getIndex(this.state.currentSlug)+1;
                if(typeof(this.state.exercises[i]) != 'undefined') return this.state.exercises[i];
                else return null;
            },
            previous: () => {
                if(this.state.introOpen && this.state.intro) return null;

                const i = this.state.getIndex(this.state.currentSlug)-1;
                if(typeof(this.state.exercises[i]) != 'undefined') return this.state.exercises[i];
                else return null;
            }
        };
    }
    componentDidMount(){
        if(this.state.host){
            fetch(this.state.host+'/config').then(resp => resp.json()).then(configObject => {
                    let urlConfig = getParams("config");
                    if(urlConfig) urlConfig = JSON.parse(atob(urlConfig));

                    configObject = Object.assign(configObject, { config: deepMerge(configObject.config, urlConfig) });
                    this.setState({ configObject: configObject});
                    
                    // google tag manager and analytics extra information
                    TagManager.dataLayer({ dataLayer: {
                        slug: configObject.slug,
                        language: configObject.language,
                        skills: configObject.skills,
                        grading: configObject.grading,
                    }});

                    const session = Session.getSession(configObject.session || "bc-exercises");
                    if(!session.active) Session.start({ payload: { showHelp: true, currentProgress: this.state.currentProgress } }, configObject.session || "bc-exercises");
                    else if(typeof session.payload.showHelp === 'undefined') Session.setPayload({ showHelp:true, currentProgress: this.state.currentProgress });
        
                    loadExercises()
                        .then((_exercises) => {

                            if(!Array.isArray(_exercises) || _exercises.length == 0) throw new LearnPackError("No exercises have been found");
                            //mark all as not done at the begginning unless they come with a status already
                            const exercises = _exercises.map(e => {
                                if(e.done === undefined) e.done = false;
                                return e;
                            });

                            this.setState({ exercises, error: null });
                            if((!window.location.hash || window.location.hash == '#')){
                                const _savedSlug = sessionStorage.getItem('exercise-slug');
                                if(_savedSlug && typeof _savedSlug == "string" && _savedSlug != ""){
                                    this.loadInstructions(_savedSlug);
                                }
                                else this.loadInstructions(exercises[0].slug);
                            }
                        })
                        .catch(error => {
                            this.setState({ error: error.details || "There was an error loading the excercise list from "+this.state.host });
                            console.error(error);
                        });
        
                    //check for changes on the hash
                    window.addEventListener("hashchange", () => this.loadInstructions());
                    if(window.location.hash && window.location.hash!='#') this.loadInstructions();
        
                    //connect to the compiler
                    Socket.start(this.state.host, () => { // <-- On Disconnect Callback!
                        const consoleStatus = {
                            code: "internal-error",
                            message: "It seems that the exercise engine is disconnected",
                            solution: "Run on your terminal the command: $ learnpack start",
                            // gif: "https://github.com/breatheco-de/breathecode-cli/blob/master/docs/errors/uknown.gif?raw=true",
                            // video: "https://www.youtube.com/watch?v=gD1Sa99GiE4"
                        };
                        this.setState({ consoleStatus });
                    });
                    const compilerSocket = Socket.createScope('compiler');
                    compilerSocket.whenUpdated((scope, data) => {
                        let state = { 
                            consoleLogs: scope.logs, 
                            consoleStatus: scope.status, 
                            possibleActions: actions.filter(a => data.allowed.includes(a.slug)) 
                        };
                        
                        if(this.state.tutorial && this.state.tutorial!=='') state.possibleActions.push({ slug: 'tutorial', label: 'Tutorial', icon: 'fas fa-graduation-cap' });
                        if(this.state.config && this.state.config.disable_grading) state.possibleActions = state.possibleActions.filter(a => a.slug !== 'test');
                        if(typeof data.code == 'string') state.currentFileContent = data.code;
                        this.setState(state);
                    });
                    compilerSocket.onStatus('compiler-success', (data) => {
                        if(this.state.config.editor.mode === "standalone"){
                            loadFile(this.state.currentSlug, this.state.currentFileName)
                                .then(content => this.setState({ currentFileContent: content, codeHasBeenChanged: false }));
                        }
                    });
                    compilerSocket.onStatus('testing-success', (data) => {
                        this.setState({ 
                            exercises: this.state.exercises.map(e => {
                                if(e.slug == this.state.currentSlug) e.done = true;
                                return e;
                            }),
                            current: Object.assign(this.state.current, { done: true })
                        });
                    });
                    compilerSocket.on("ask", async ({ inputs }) => {
                        const inputsResponses = [];

                        for (let i = 0; i < inputs.length; i++) {
                            inputsResponses.push(await prompt(inputs[i] || `Please enter the ${i+1} input`));
                        }
                        
                        compilerSocket.emit('input', {
                            inputs: inputsResponses,
                            exerciseSlug: this.state.currentSlug
                        });
                    });
                    compilerSocket.on("reload", (data) => {
                        console.log("Reloading...", data);
                        window.location.reload();
                    });
                    this.setState({ compilerSocket, config: configObject.config });
            })
            .catch(error => {
                console.error(error);
                this.setState({ consoleStatus: { code: "internal-error", message: "Unable to fetch configuration file" }});
            });
        }
    }

    resetOrPreview(a, source) {
        if (source === "statusbar") {
            if(a.slug === 'preview') this.openWindow(this.state.host+'/preview');
            else if(a.slug === 'tutorial') this.openWindow(this.state.tutorial);
            else this.state.compilerSocket.emit(a.slug, { exerciseSlug: this.state.currentSlug });
        }else{
            if(a.slug === 'preview') this.openWindow(this.state.host+'/preview');
            else this.state.compilerSocket.emit(a.slug, { exerciseSlug: this.state.currentSlug });
            
            if(a.slug === 'reset'){
                loadFile(this.state.currentSlug, this.state.currentFileName)
                    .then(content => this.setState({ currentFileContent: content, codeHasBeenChanged: false }));
            }
        }   
    }

    loadInstructions(slug=null){
        if(!slug) slug = window.location.hash.slice(1,window.location.hash.length);
        if(slug=='' || slug=='/'){
            this.state.next();
        }
        else{
            loadSingleExercise(slug)
                .then(exercise => {
                    const files = exercise.files.filter(f => f.hidden === false);
                    sessionStorage.setItem('exercise-slug', slug);
                    this.setState({
                        files,
                        currentSlug: slug,
                        current: exercise,
                        consoleLogs: [],
                        codeHasBeenChanged: true,
                        consoleStatus: { code: 'ready', message: getStatus('ready') },
                        menuOpened: false
                    });
                    if(files.length > 0){
                        if(this.state.config.editor.mode === 'standalone') loadFile(slug, files[0].name).then(content => this.setState({
                            currentFileContent: content,
                            currentFileName: files[0].name,
                            possibleActions: this.state.possibleActions.filter(a => a.slug !== 'preview'),
                            currentFileExtension: files[0].name.split('.').pop()
                        }));

                        if(this.state.config.grading === 'isolated') this.state.compilerSocket.emit("open", { 
                            exerciseSlug: this.state.currentSlug, 
                            files: files.map(f => f.path)
                        });
                    }
                })
                .catch(error => {
                    this.setState({ error: "There was an error loading the exercise: "+slug });
                    console.error(error);
                });
            loadReadme(slug, this.state.currentTranslation).then(readme => {
                const tutorial = !readme.attributes ? null : readme.attributes.tutorial || null;
                const intro = !readme.attributes ? null : readme.attributes.intro || null;
                const _readme = readme.body || readme;

                let possibleActions = this.state.possibleActions;
                if(tutorial) possibleActions = possibleActions.concat({ slug: 'tutorial', label: 'Tutorial', icon: 'fas fa-graduation-cap' });

                this.setState({ currentInstructions: _readme, tutorial, intro, possibleActions });
            });
        }
    }

    openWindow(url){
        if(!['gitpod', 'vscode'].includes(this.state.config.editor.agent)){
            window.open(url);
        }
        else{
            this.state.compilerSocket.openWindow({
                url,
                exerciseSlug: this.state.currentSlug
            });
        }
    }

    render(){
        let { showHelp } = Session.getPayload();

        //close the help if there is a video open right now
        if(this.state.introOpen && this.state.intro) showHelp = false;

        if(!this.state.host) return (<div className="alert alert-danger text-center"> ⚠️ No host specified for the application</div>);
        if(this.state.error) return <div className="alert alert-danger">
            {this.state.error}
            <SmartInput onSave={(value) => {
                window.location = "?host="+value;
            }} />
        </div>;
        const size = {
            vertical: {
                min: 50,
                init: 550
            },
            horizontal: {
                min: 50,
                init: 450
            }
        };

        const nextButtonColors = (status) => {
            if(!status) return 'btn-dark';
            switch(status.code){
                case "testing-success": return 'btn-success glow';
                default: return 'btn-dark';
            }
        };

        const jumpToExercise = (slug) => {
            if(slug === "help"){
                this.setState({ openHelpPanel: true });
                return;
            } 
            if(slug > this.state.currentSlug && this.state.current.graded && !this.state.current.done && this.state.config.grading === "incremental") 
                alert("Test your exercise solution before you can continue to the next step");
            else window.location.hash = "#"+slug;
        };

        if (this.state.consoleStatus && this.state.consoleStatus.code === "internal-error") 
            return <InternalError 
                gif={this.state.consoleStatus.gif} 
                config={this.state.config}
                message={this.state.consoleStatus.message} 
                solution={this.state.consoleStatus.solution} 
                repo={this.state.config ? this.state.config.repository : null} 
                video={this.state.consoleStatus.video} 
            />;

        if(!this.state.config) return <Loading className="centered-box" />;

        if(this.state.openHelpPanel) return <HelpPanel onClose={() => this.setState({ openHelpPanel: false })} config={this.state.config} />;

        if(this.state.config.editor === undefined) return null;

        return <div className={`mode-${this.state.config.editor.mode}`}>
            { this.state.helpSteps[this.state.config.editor.mode] && <Joyride
                    steps={this.state.helpSteps[this.state.config.editor.mode]}
                    continuous={true}
                    run={showHelp === true && this.state.getIndex(this.state.currentSlug) === 1}
                    locale={{ back: 'Previous', close: 'Close', last: 'Finish', next: 'Next' }}
                    styles={{
                        options: {
                            backgroundColor: '#FFFFFF',
                            overlayColor: 'rgba(0, 0, 0, 0.9)'
                        }
                    }}
                    callback = {(tour) => {
                        const { type } = tour;
                        if (type === 'tour:end') {
                            Session.setPayload({ showHelp: false });
                        }
                    }}
                />
            }
            {this.state.config.editor.mode === "standalone" ?
                <SplitPane split="vertical" style={{ backgroundColor: "#333333"}} minSize={size.vertical.min} defaultSize={size.vertical.init}>
                    <Sidebar 
                        disabled={isPending(this.state.consoleStatus)}
                        previous={this.state.previous()}
                        next={this.state.next()}
                        current={this.state.current}
                        exercises={this.state.exercises}
                        defaultTranslation={this.state.currentTranslation}
                        className={`editor-${this.state.config.editor.mode}`}
                        onClick={slug => jumpToExercise(slug)}
                        onHelpClick={() => this.setState({ openHelpPanel: true })}
                        onLanguageClick={lang => loadReadme(this.state.current.slug, lang).then(readme => {
                                const tutorial = !readme.attributes ? null : readme.attributes.tutorial || null;
                                const intro = !readme.attributes ? null : readme.attributes.intro || null;
                                const _readme = readme.body || readme;
                                this.setState({ currentInstructions: _readme, tutorial, intro, currentTranslation: lang });
                            })
                        }
                        onBugClick={() => this.openWindow(this.state.configObject.repository !== null ? `https://github.com/learnpack/learnpack/issues/new?assignees=&labels=&projects=learnpack/1&title=Excercise%20Bug&body=Describe the bug:%0D%0A%0D%0A**1.%20Exercise%20Name:**%20${this.state.current.slug}%0D%0A%0D%0A**2.%20Repository%20URL:**%20${this.state.configObject.repository}`:`https://github.com/learnpack/learnpack/issues/new?title=Excercise%20Bug&projects=learnpack/1&body=**1.20%Exercise%20Name:**%20${this.state.current.slug}`)}
                        onOpen={status => this.setState({ menuOpened: status })}
                    >
                        { !this.state.menuOpened && this.state.possibleActions.length > 0 && (!this.state.introOpen || !this.state.intro) &&
                            <StatusBar
                                actions={this.state.possibleActions.filter(a => (a.slug === "preview" && this.state.config.onCompilerSuccess === "open-browser") ? false : true)}
                                status={this.state.consoleStatus}
                                exercises={this.state.exercises}
                                disabled={isPending(this.state.consoleStatus)}
                                onAction={async (a) => {
                                    if(a.confirm !== true){
                                        this.resetOrPreview(a);
                                    } else {
                                        if (await confirm("Are you sure?")) {
                                            this.resetOrPreview(a, "statusbar");
                                        }
                                        
                                    }
                                }}
                            />
                        }
                        { this.state.introOpen && this.state.intro ?
                            <Intro url={this.state.intro} onClose={() => this.setState({ introOpen: false })} playing={!showHelp} />
                            :
                            <MarkdownParser className="markdown" context={this.state.config} source={this.state.currentInstructions} />
                        }
                    </Sidebar>
                    <div>
                        { this.state.files.length > 0 &&
                            <SplitPane split="horizontal"
                                minSize={size.horizontal.min}
                                defaultSize={size.horizontal.init}
                                onChange={ size => this.setState({editorSize: size}) }
                            >
                                <Editor
                                    files={this.state.files}
                                    language={this.state.currentFileExtension}
                                    buffer={this.state.currentFileContent}
                                    onOpen={(fileName) => loadFile(this.state.currentSlug,fileName).then(content => this.setState({ currentFileContent: content, currentFileName: fileName.name, currentFileExtension: fileName.name.split('.').pop() })) }
                                    showStatus={true}
                                    onIdle={() => {
                                        saveFile(this.state.currentSlug, this.state.currentFileName, this.state.currentFileContent)
                                                    .then(status => this.setState({ isSaving: false, consoleLogs: ['Your code has been saved successfully.', 'Ready to compile or test...'] }))
                                                    .catch(error => this.setState({ isSaving: false, consoleLogs: ['There was an error saving your code.'] }));
                                    }}
                                    height={this.state.editorSize}
                                    onChange={(content) => this.setState({
                                        currentFileContent: content,
                                        codeHasBeenChanged: true,
                                        isSaving: true,
                                        consoleLogs: [],
                                        consoleStatus: { code: 'ready', message: getStatus('ready') }
                                    })}
                                />
                                <Terminal
                                    mode={this.state.config.editor.mode}
                                    disabled={isPending(this.state.consoleStatus) || this.state.isSaving}
                                    host={this.state.host}
                                    status={this.state.isSaving ? { code: 'saving', message: getStatus('saving') } : this.state.consoleStatus}
                                    logs={this.state.consoleLogs}
                                    onAction={async (a) => {
                                        if(a.confirm !== true){
                                            this.resetOrPreview(a, "terminal");
                                        } else {
                                            if (await confirm("Are you sure?")) {
                                                this.resetOrPreview(a, "terminal");
                                            }
                                        }
                                    }}
                                    height={window.innerHeight - this.state.editorSize}
                                    exercise={this.state.currentSlug}
                                    />
                            </SplitPane>
                        }
                    </div>
                </SplitPane>
                :
                <div>
                    { !this.state.menuOpened && this.state.possibleActions.length > 0 && (!this.state.introOpen || !this.state.intro) &&
                        <StatusBar
                            actions={this.state.possibleActions.filter(a => (a.slug === "preview" && this.state.config.onCompilerSuccess === "open-browser") ? false : true)}
                            status={this.state.consoleStatus}
                            exercises={this.state.exercises}
                            disabled={isPending(this.state.consoleStatus)}
                            onAction={async (a) => {
                                if(a.confirm !== true){
                                    this.resetOrPreview(a, "statusbar");
                                } else {
                                    if (await confirm("Are you sure?")) {
                                        this.resetOrPreview(a, "statusbar");
                                    }
                                }
                            }}
                        />
                    }
                    <Sidebar 
                        disabled={isPending(this.state.consoleStatus)}
                        previous={this.state.previous()}
                        next={this.state.next()}
                        current={this.state.current}
                        defaultTranslation={this.state.currentTranslation}
                        exercises={this.state.exercises}
                        className={`editor-${this.state.config.editor.mode}`}
                        onClick={slug => jumpToExercise(slug)}
                        onOpen={status => this.setState({ menuOpened: status })}
                        onHelpClick={() => this.setState({ openHelpPanel: true })}

                        

                        onBugClick={() => this.openWindow(this.state.configObject.repository !== null ? `https://github.com/learnpack/learnpack/issues/new?assignees=&labels=&projects=learnpack/1&title=Excercise%20Bug&body=Describe the bug:%0D%0A%0D%0A**1.%20Exercise%20Name:**%20${this.state.current.slug}%0D%0A%0D%0A**2.%20Repository%20URL:**%20${this.state.configObject.repository}`:`https://github.com/learnpack/learnpack/issues/new?title=Excercise%20Bug&projects=learnpack/1&body=**1.20%Exercise%20Name:**%20${this.state.current.slug}`)}
                        onLanguageClick={lang => loadReadme(this.state.current.slug, lang).then(readme => {
                                const tutorial = !readme.attributes ? null : readme.attributes.tutorial || null;
                                const intro = !readme.attributes ? null : readme.attributes.intro || null;
                                const _readme = readme.body || readme;
                                this.setState({ currentInstructions: _readme, tutorial, intro, currentTranslation: lang });
                            })
                        }
                    >
                        { this.state.introOpen && this.state.intro ?
                            <Intro url={this.state.intro} onClose={() => this.setState({ introOpen: false })} playing={!showHelp} />
                            :
                            <MarkdownParser className="markdown" context={this.state.config} source={this.state.currentInstructions} />
                        }
                    </Sidebar>
                </div>
            }
        </div>;
    }
}

/*
    onPrettify={() => this.state.compilerSocket.emit('prettify', {
        fileName: this.state.currentFileName,
        exerciseSlug: this.state.currentSlug
    })}
*/
