/**
 * Comprehensive environment variables knowledge base
 * Based on common Unix/Linux environment variables with detailed descriptions
 */

export interface EnvVariableInfo {
  name: string;
  category: string;
  description: string;
  value_format: string;
  example_values: string[];
}

export const environmentVariablesKnowledge: Record<string, EnvVariableInfo> = {
  // Core Path Variables
  PATH: {
    name: 'PATH',
    category: '核心路径',
    description: '定义一个由冒号分隔的目录列表。当用户在命令行输入一个可执行程序名时，Shell会按照此列表的顺序在这些目录中搜索该程序。这是类Unix系统中最关键的环境变量之一。',
    value_format: '一个由冒号分隔的绝对目录路径列表。',
    example_values: ['/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin']
  },
  HOME: {
    name: 'HOME',
    category: '核心路径',
    description: '指向当前用户的主目录的绝对路径。许多程序使用此变量来定位用户配置文件（例如 ~/.config）。不带参数的 \'cd\' 命令会切换到此目录。',
    value_format: '一个指向用户主目录的绝对路径。',
    example_values: ['/home/username', '/Users/username']
  },
  PWD: {
    name: 'PWD',
    category: '核心路径',
    description: '表示"Print Working Directory"，存储当前工作目录的绝对路径。当使用 \'cd\' 命令更改目录时，Shell 会自动更新此变量。',
    value_format: '一个指向当前工作目录的绝对路径。',
    example_values: ['/home/username/projects/my-app']
  },
  OLDPWD: {
    name: 'OLDPWD',
    category: '核心路径',
    description: '存储上一个工作目录的绝对路径。这使得 \'cd -\' 命令能够快速在当前目录和上一个目录之间切换。',
    value_format: '一个指向上一个工作目录的绝对路径。',
    example_values: ['/home/username/documents']
  },
  LD_LIBRARY_PATH: {
    name: 'LD_LIBRARY_PATH',
    category: '核心路径',
    description: '定义一个由冒号分隔的目录列表，动态链接器在程序启动时会优先在这些目录中搜索共享库（.so 文件），然后再搜索标准的系统库目录。不当使用可能导致依赖冲突。',
    value_format: '一个由冒号分隔的绝对目录路径列表。',
    example_values: ['/opt/myapp/lib:/usr/local/custom_lib']
  },
  MANPATH: {
    name: 'MANPATH',
    category: '核心路径',
    description: '定义一个由冒号分隔的目录列表，\'man\' 命令会在这些目录中查找手册页。如果未设置，通常会根据 PATH 变量自动推断。',
    value_format: '一个由冒号分隔的绝对目录路径列表。',
    example_values: ['/usr/local/share/man:/usr/share/man']
  },

  // User & Session Variables
  USER: {
    name: 'USER',
    category: '用户与会话',
    description: '当前登录用户的用户名。这是最常用的表示用户身份的变量。',
    value_format: '一个字符串，表示用户名。',
    example_values: ['alice', 'john']
  },
  LOGNAME: {
    name: 'LOGNAME',
    category: '用户与会话',
    description: '当前登录用户的用户名，功能与 USER 类似。一些较旧的或遵循特定 POSIX 标准的程序可能会使用此变量。',
    value_format: '一个字符串，表示用户名。',
    example_values: ['bob']
  },
  UID: {
    name: 'UID',
    category: '用户与会话',
    description: '当前用户的数字用户ID。这是系统内部唯一标识用户的号码。',
    value_format: '一个非负整数。',
    example_values: ['1000', '501']
  },
  SHELL: {
    name: 'SHELL',
    category: '用户与会话',
    description: '当前用户的默认登录Shell程序的绝对路径。此值通常在创建用户时从 /etc/passwd 文件中读取。',
    value_format: '一个指向Shell可执行文件的绝对路径。',
    example_values: ['/bin/zsh', '/bin/bash', '/usr/bin/fish']
  },
  TERM: {
    name: 'TERM',
    category: '用户与会话',
    description: '指定当前终端模拟器的类型（例如 \'xterm-256color\'）。基于文本的应用程序（如 vim, htop）使用此变量来确定如何正确渲染颜色、光标移动和特殊字符。',
    value_format: '一个表示终端类型的字符串。',
    example_values: ['xterm-256color', 'screen', 'vt100', 'rxvt-unicode']
  },
  SHLVL: {
    name: 'SHLVL',
    category: '用户与会话',
    description: '表示Shell的嵌套级别。登录时的初始Shell级别为1，每当从一个Shell内部启动一个新的Shell时，该值加1。可用于脚本中检测子Shell环境。',
    value_format: '一个正整数。',
    example_values: ['1', '2', '3']
  },

  // Localization Variables
  LANG: {
    name: 'LANG',
    category: '本地化',
    description: '为所有未被特定 LC_* 变量覆盖的本地化类别设置默认的区域设置。它定义了默认的语言、国家和字符集。',
    value_format: '格式为 \'language[_territory][.charset]\' 的字符串。',
    example_values: ['en_US.UTF-8', 'zh_CN.UTF-8', 'ja_JP.UTF-8']
  },
  LC_ALL: {
    name: 'LC_ALL',
    category: '本地化',
    description: '一个具有最高优先级的本地化变量。如果设置，它将强制覆盖 LANG 和所有其他 LC_* 变量的值。通常用于在脚本中创建一个统一和可预测的本地化环境。',
    value_format: '格式为 \'language[_territory][.charset]\' 的字符串。',
    example_values: ['C', 'POSIX', 'en_US.UTF-8']
  },
  LC_CTYPE: {
    name: 'LC_CTYPE',
    category: '本地化',
    description: '定义字符分类和转换规则，例如字母、数字的定义，以及大小写转换的行为。它也决定了字符编码。',
    value_format: '格式为 \'language[_territory][.charset]\' 的字符串。',
    example_values: ['en_US.UTF-8', 'C.UTF-8']
  },
  LC_TIME: {
    name: 'LC_TIME',
    category: '本地化',
    description: '定义日期和时间的表示格式，例如星期、月份的名称以及 \'date\' 命令的默认输出格式。',
    value_format: '格式为 \'language[_territory][.charset]\' 的字符串。',
    example_values: ['en_US.UTF-8', 'de_DE.UTF-8']
  },

  // Shell Customization
  PS1: {
    name: 'PS1',
    category: 'Shell 定制',
    description: '定义主命令提示符的格式。可以通过特殊的转义序列来显示用户名、主机名、当前目录、Git分支等信息。',
    value_format: '包含文本和特殊转义序列（如 \\u, \\h, \\w）的字符串。',
    example_values: ['\\u@\\h:\\w\\$ ', '[\\u@\\h \\W]\\$ ', '%n@%m %~ %# ']
  },
  HISTFILE: {
    name: 'HISTFILE',
    category: 'Shell 定制',
    description: '指定存储命令历史的文件的绝对路径。默认通常是 ~/.bash_history 或 ~/.zsh_history。',
    value_format: '一个指向文件的绝对路径。',
    example_values: ['~/.zsh_history', '~/.bash_history']
  },
  HISTSIZE: {
    name: 'HISTSIZE',
    category: 'Shell 定制',
    description: '定义在当前Shell会话的内存中保留的命令历史记录条数。',
    value_format: '一个正整数。',
    example_values: ['1000', '10000', '50000']
  },
  HISTFILESIZE: {
    name: 'HISTFILESIZE',
    category: 'Shell 定制',
    description: '定义在 HISTFILE 文件中保存的最大命令历史记录条数。',
    value_format: '一个正整数。',
    example_values: ['2000', '20000', '100000']
  },
  HISTCONTROL: {
    name: 'HISTCONTROL',
    category: 'Shell 定制',
    description: '控制命令历史的记录方式。\'ignorespace\' 会忽略以空格开头的命令，\'ignoredups\' 会忽略连续的重复命令。',
    value_format: '一个由冒号分隔的选项列表，如 \'ignorespace\' 或 \'ignoredups\'。',
    example_values: ['ignoredups', 'ignorespace:ignoredups', 'ignoreboth']
  },

  // Default Applications
  EDITOR: {
    name: 'EDITOR',
    category: '默认应用',
    description: '指定默认的文本编辑器。许多命令行工具（如 \'crontab -e\'）在需要编辑文本时会调用此程序。这是历史悠久的变量，作为 VISUAL 的备用选项。',
    value_format: '一个指向编辑器可执行文件的命令或路径。',
    example_values: ['nano', 'vim', 'emacs', 'vi']
  },
  VISUAL: {
    name: 'VISUAL',
    category: '默认应用',
    description: '指定首选的全屏可视化文本编辑器。现代应用程序（如 \'git commit\'）会优先使用 VISUAL，如果未设置，则回退到 EDITOR。',
    value_format: '一个指向编辑器可执行文件的命令或路径。',
    example_values: ['nvim', 'code --wait', 'subl --wait', 'atom --wait']
  },
  PAGER: {
    name: 'PAGER',
    category: '默认应用',
    description: '指定用于分页显示长文本输出的程序。\'man\' 和 \'git log\' 等命令使用此程序来逐页显示内容。',
    value_format: '一个指向分页程序可执行文件的命令或路径。',
    example_values: ['less', 'more', 'most', 'bat']
  },

  // Zsh Ecosystem
  ZSH: {
    name: 'ZSH',
    category: 'Zsh 生态',
    description: '（Oh My Zsh 必需）指向 Oh My Zsh 安装目录的绝对路径，通常是 ~/.oh-my-zsh。框架的核心脚本依赖此变量。',
    value_format: '一个指向目录的绝对路径。',
    example_values: ['$HOME/.oh-my-zsh', '~/.oh-my-zsh']
  },
  ZSH_THEME: {
    name: 'ZSH_THEME',
    category: 'Zsh 生态',
    description: '（Oh My Zsh 可选）设置要使用的 Oh My Zsh 主题的名称。设置为空字符串可禁用主题，设置为 \'random\' 可在每次启动时加载随机主题。',
    value_format: '一个表示主题名称的字符串。',
    example_values: ['robbyrussell', 'agnoster', 'random', 'powerlevel10k/powerlevel10k']
  },
  plugins: {
    name: 'plugins',
    category: 'Zsh 生态',
    description: '（Oh My Zsh 可选）一个Zsh数组，包含要加载的Oh My Zsh插件列表。插件名称之间用空格分隔。',
    value_format: '一个用括号括起来、以空格分隔的插件名称列表。',
    example_values: ['(git zsh-autosuggestions zsh-syntax-highlighting)', '(git docker kubectl)']
  },

  // Java Ecosystem
  JAVA_HOME: {
    name: 'JAVA_HOME',
    category: 'Java 生态',
    description: '指向Java开发工具包（JDK）的根安装目录。许多Java构建工具（如Maven, Gradle）和应用程序使用此变量来定位Java编译器和运行时。',
    value_format: '一个指向JDK根目录的绝对路径。',
    example_values: [
      '/usr/lib/jvm/java-17-openjdk-amd64',
      '/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home',
      'C:\\Program Files\\Java\\jdk-17'
    ]
  },
  CLASSPATH: {
    name: 'CLASSPATH',
    category: 'Java 生态',
    description: '一个由路径分隔符（Unix为\':\'，Windows为\';\'）分隔的列表，包含目录、JAR文件或ZIP文件的路径。JVM使用它来查找用户自定义的Java类。在现代构建工具中已不常用。',
    value_format: '一个由冒号分隔的路径列表。',
    example_values: ['.:/usr/local/java/my-classes:/usr/local/java/lib/my-lib.jar']
  },
  MAVEN_OPTS: {
    name: 'MAVEN_OPTS',
    category: 'Java 生态',
    description: '为运行Apache Maven的JVM提供额外的命令行选项。最常用于设置内存限制，例如 \'-Xmx2048m\'，以防止在构建大型项目时出现内存溢出错误。',
    value_format: '一个包含JVM选项的字符串。',
    example_values: ['-Xmx2048m -Xms512m', '-Xmx4g -XX:+UseG1GC']
  },

  // Python Environment
  PYTHONPATH: {
    name: 'PYTHONPATH',
    category: 'Python 环境',
    description: '一个由冒号分隔的目录列表，这些目录会被添加到Python的模块搜索路径（sys.path）中。它允许Python解释器找到非标准位置的模块。现代Python开发推荐使用虚拟环境而非此变量。',
    value_format: '一个由冒号分隔的目录路径列表。',
    example_values: ['/home/user/my_project/libs', '~/python-libs']
  },
  VIRTUAL_ENV: {
    name: 'VIRTUAL_ENV',
    category: 'Python 环境',
    description: '当激活Python虚拟环境（venv）时，此变量会自动设置，指向该虚拟环境的根目录。它的存在是判断当前是否处于隔离环境中的可靠标志。',
    value_format: '一个指向虚拟环境根目录的绝对路径。',
    example_values: ['/home/user/projects/my-app/.venv', '~/projects/myproject/venv']
  },

  // Node.js Environment
  NODE_ENV: {
    name: 'NODE_ENV',
    category: 'Node.js 环境',
    description: '定义Node.js应用程序的运行环境。通常设置为 \'development\', \'production\', 或 \'test\'。许多框架（如Express）会根据此变量的值调整行为，例如日志级别、缓存和错误处理。',
    value_format: '必须是 \'development\', \'production\', 或 \'test\' 之一。',
    example_values: ['development', 'production', 'test', 'staging']
  },
  NODE_PATH: {
    name: 'NODE_PATH',
    category: 'Node.js 环境',
    description: '一个由冒号分隔的目录列表，Node.js在解析模块时，如果在本地node_modules中找不到，会搜索这些目录。不推荐使用，因为它会破坏模块的本地依赖原则。',
    value_format: '一个由冒号分隔的目录路径列表。',
    example_values: ['/usr/local/lib/node_modules', '~/.npm-global/lib/node_modules']
  },

  // Go Environment
  GOROOT: {
    name: 'GOROOT',
    category: 'Go 环境',
    description: '指向Go SDK的安装位置，包含Go编译器、标准库和工具。现代Go版本通常会自动检测，用户无需手动设置。',
    value_format: '一个指向Go SDK安装目录的绝对路径。',
    example_values: ['/usr/local/go', '/opt/go', 'C:\\Go']
  },
  GOPATH: {
    name: 'GOPATH',
    category: 'Go 环境',
    description: '定义Go的工作区根目录。在Go模块出现之前，它用于存放所有源代码、编译包和可执行文件。在现代Go中，主要用作 \'go install\' 的安装目录和模块缓存位置。',
    value_format: '一个指向Go工作区目录的绝对路径。',
    example_values: ['$HOME/go', '~/go', '/opt/go-workspace']
  },
  GO111MODULE: {
    name: 'GO111MODULE',
    category: 'Go 环境',
    description: '控制Go的模块感知模式。\'on\' 强制使用模块，\'off\' 禁用模块并使用GOPATH模式，\'auto\' 根据是否存在go.mod文件自动切换。自Go 1.16起，默认为 \'on\'。',
    value_format: '必须是 \'on\', \'off\', 或 \'auto\' 之一。',
    example_values: ['on', 'auto', 'off']
  },

  // Rust Toolchain
  RUSTUP_HOME: {
    name: 'RUSTUP_HOME',
    category: 'Rust 工具链',
    description: '指定 \'rustup\'（Rust工具链管理器）的根目录，用于存储已安装的工具链和配置。默认是 ~/.rustup。',
    value_format: '一个指向目录的绝对路径。',
    example_values: ['$HOME/.rustup', '~/.rustup']
  },
  CARGO_HOME: {
    name: 'CARGO_HOME',
    category: 'Rust 工具链',
    description: '指定 \'cargo\'（Rust包管理器）的根目录，用于存储包注册表索引、依赖缓存和通过 \'cargo install\' 安装的二进制文件。默认是 ~/.cargo。',
    value_format: '一个指向目录的绝对路径。',
    example_values: ['$HOME/.cargo', '~/.cargo']
  },

  // Build System Variables
  CC: {
    name: 'CC',
    category: '构建系统',
    description: '指定用于编译C语言代码的编译器程序。构建系统（如make）会使用此变量来调用C编译器。',
    value_format: '一个指向C编译器可执行文件的命令或路径。',
    example_values: ['gcc', 'clang', 'cc', '/usr/bin/gcc-11']
  },
  CXX: {
    name: 'CXX',
    category: '构建系统',
    description: '指定用于编译C++语言代码的编译器程序。构建系统（如make）会使用此变量来调用C++编译器。',
    value_format: '一个指向C++编译器可执行文件的命令或路径。',
    example_values: ['g++', 'clang++', 'c++', '/usr/bin/g++-11']
  },
  CFLAGS: {
    name: 'CFLAGS',
    category: '构建系统',
    description: '包含传递给C编译器的额外标志。常用于设置优化级别（-O2）、警告（-Wall）、调试信息（-g）等。',
    value_format: '一个包含编译器标志的字符串。',
    example_values: ['-O2 -Wall', '-g -O0', '-march=native -O3']
  },
  CXXFLAGS: {
    name: 'CXXFLAGS',
    category: '构建系统',
    description: '包含传递给C++编译器的额外标志。除了CFlags的功能外，还可用于设置C++特定标准（-std=c++17）等。',
    value_format: '一个包含编译器标志的字符串。',
    example_values: ['-std=c++17 -O2 -Wall', '-std=c++20 -g']
  },
  LDFLAGS: {
    name: 'LDFLAGS',
    category: '构建系统',
    description: '包含传递给链接器的额外标志。常用于指定库搜索路径（-L/path/to/lib）和要链接的库（-lmath）。',
    value_format: '一个包含链接器标志的字符串。',
    example_values: ['-L/usr/local/lib -lcustom', '-Wl,-rpath,/opt/lib']
  },
  CPPFLAGS: {
    name: 'CPPFLAGS',
    category: '构建系统',
    description: '包含传递给C预处理器（CPP）的额外标志，对C和C++都有效。常用于指定头文件搜索路径（-I/path/to/include）和定义宏（-DDEBUG）。',
    value_format: '一个包含预处理器标志的字符串。',
    example_values: ['-I/usr/local/include -DDEBUG', '-I/opt/include -DNDEBUG']
  },
  PKG_CONFIG_PATH: {
    name: 'PKG_CONFIG_PATH',
    category: '构建系统',
    description: '一个由冒号分隔的目录列表，\'pkg-config\' 工具会在这些目录中搜索.pc 元数据文件，以自动获取库的编译和链接标志。',
    value_format: '一个由冒号分隔的目录路径列表。',
    example_values: ['/usr/local/lib/pkgconfig:/opt/custom/lib/pkgconfig']
  },

  // Network Proxy
  HTTP_PROXY: {
    name: 'HTTP_PROXY',
    category: '网络代理',
    description: '为HTTP请求指定代理服务器的URL。许多命令行工具和应用程序会读取此变量以通过代理路由其HTTP流量。为兼容性，建议同时设置小写版本 \'http_proxy\'。',
    value_format: '格式为 \'http://[user:pass@]host:port\' 的URL。',
    example_values: [
      'http://proxy.example.com:8080',
      'http://user:password@192.168.1.1:8080'
    ]
  },
  HTTPS_PROXY: {
    name: 'HTTPS_PROXY',
    category: '网络代理',
    description: '为HTTPS请求指定代理服务器的URL。其工作方式与HTTP_PROXY类似，但用于加密的HTTPS流量。建议同时设置小写版本 \'https_proxy\'。',
    value_format: '格式为 \'http://[user:pass@]host:port\' 或 \'https://[user:pass@]host:port\' 的URL。',
    example_values: ['http://proxy.example.com:8080', 'https://secure-proxy.example.com:8443']
  },
  NO_PROXY: {
    name: 'NO_PROXY',
    category: '网络代理',
    description: '一个由逗号分隔的主机名、域名或IP地址列表，这些目标地址的请求将不通过代理服务器，而是直接连接。对于访问内部网络资源非常重要。',
    value_format: '一个由逗号分隔的主机名、域名（可带前导\'.\'）、IP地址或CIDR块列表。',
    example_values: [
      'localhost,127.0.0.1,.internal.company.com,192.168.0.0/16',
      '*.local,169.254.0.0/16'
    ]
  }
};

// Helper functions
export function getEnvVariableInfo(name: string): EnvVariableInfo | undefined {
  return environmentVariablesKnowledge[name];
}

export function getVariablesByCategory(category: string): EnvVariableInfo[] {
  return Object.values(environmentVariablesKnowledge).filter(v => v.category === category);
}

export function searchVariables(query: string): EnvVariableInfo[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(environmentVariablesKnowledge).filter(v => 
    v.name.toLowerCase().includes(lowerQuery) ||
    v.description.toLowerCase().includes(lowerQuery) ||
    v.category.toLowerCase().includes(lowerQuery)
  );
}

export function getAllCategories(): string[] {
  const categories = new Set<string>();
  Object.values(environmentVariablesKnowledge).forEach(v => {
    categories.add(v.category);
  });
  return Array.from(categories).sort();
}

export function getSuggestedVariables(existingVars: Set<string>): EnvVariableInfo[] {
  // Return common variables that are not yet set
  const commonVars = ['PATH', 'HOME', 'USER', 'SHELL', 'TERM', 'EDITOR', 'LANG'];
  return commonVars
    .filter(name => !existingVars.has(name))
    .map(name => environmentVariablesKnowledge[name])
    .filter(Boolean);
}

// Get a formatted example value for a variable
export function getDefaultValue(varInfo: EnvVariableInfo): string {
  if (varInfo.example_values && varInfo.example_values.length > 0) {
    // Return the first example value
    return varInfo.example_values[0];
  }
  
  // Provide sensible defaults based on common patterns
  switch (varInfo.name) {
    case 'PATH':
      return '/usr/local/bin:/usr/bin:/bin';
    case 'HOME':
      return '$HOME';
    case 'USER':
      return '$USER';
    case 'SHELL':
      return '/bin/zsh';
    case 'EDITOR':
      return 'vim';
    case 'LANG':
      return 'en_US.UTF-8';
    case 'NODE_ENV':
      return 'development';
    default:
      return '';
  }
}

// Validate if a value matches the expected format
export function validateValue(varInfo: EnvVariableInfo, value: string): { valid: boolean; message?: string } {
  // Check for path-like variables
  if (varInfo.category === '核心路径' || varInfo.name.includes('PATH')) {
    if (varInfo.name === 'PATH' || varInfo.name.includes('_PATH')) {
      // Should be colon-separated paths
      const paths = value.split(':');
      const invalidPaths = paths.filter(p => p && !p.startsWith('/') && !p.startsWith('~') && !p.startsWith('$'));
      if (invalidPaths.length > 0) {
        return {
          valid: false,
          message: `路径应该以 '/', '~' 或 '$' 开头。无效路径: ${invalidPaths.join(', ')}`
        };
      }
    }
  }

  // Check for integer values
  if (varInfo.name === 'HISTSIZE' || varInfo.name === 'HISTFILESIZE' || varInfo.name === 'UID' || varInfo.name === 'SHLVL') {
    if (!/^\d+$/.test(value)) {
      return {
        valid: false,
        message: '该变量应该是一个正整数'
      };
    }
  }

  // Check for specific enum values
  if (varInfo.name === 'NODE_ENV') {
    const validValues = ['development', 'production', 'test', 'staging'];
    if (!validValues.includes(value)) {
      return {
        valid: false,
        message: `NODE_ENV 应该是以下值之一: ${validValues.join(', ')}`
      };
    }
  }

  if (varInfo.name === 'GO111MODULE') {
    const validValues = ['on', 'off', 'auto'];
    if (!validValues.includes(value)) {
      return {
        valid: false,
        message: `GO111MODULE 应该是以下值之一: ${validValues.join(', ')}`
      };
    }
  }

  return { valid: true };
}